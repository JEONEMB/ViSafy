from datetime import UTC, date, datetime
from urllib.parse import urlparse

import chromadb

from app.config import Settings
from app.ingestion.models import OfficialDocument
from app.ingestion.text_processor import FinancialDocumentProcessor
from app.rag.embedding import LocalHashEmbedding
from app.rag.models import RetrievedDocument


class OfficialDocumentStore:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.processor = FinancialDocumentProcessor(
            settings.rag_chunk_size, settings.rag_chunk_overlap
        )
        self.embedding = LocalHashEmbedding()
        self.client = chromadb.PersistentClient(path=settings.vector_db_path)

    def sync(self, documents: list[OfficialDocument]) -> tuple[int, int]:
        for document in documents:
            self._validate(document)
        collection_names = {
            collection if isinstance(collection, str) else collection.name
            for collection in self.client.list_collections()
        }
        if self.settings.rag_collection_name in collection_names:
            self.client.delete_collection(self.settings.rag_collection_name)
        collection = self._collection()
        indexed_documents = 0
        indexed_chunks = 0
        for document in documents:
            chunks = self.processor.chunk(document.content)
            if not chunks:
                continue
            ids = [
                f"{document.document_id}:{document.product_id}:{index}"
                for index in range(len(chunks))
            ]
            metadatas = [self._metadata(document, index) for index in range(len(chunks))]
            collection.upsert(
                ids=ids,
                documents=chunks,
                metadatas=metadatas,
                embeddings=[self.embedding.embed(chunk) for chunk in chunks],
            )
            indexed_documents += 1
            indexed_chunks += len(chunks)
        return indexed_documents, indexed_chunks

    def retrieve(
        self, product_id: int, rule_key: str, query: str, top_k: int
    ) -> list[RetrievedDocument]:
        collection = self._collection()
        if collection.count() == 0:
            return []
        today_ordinal = date.today().toordinal()
        combined_query = f"Rule {rule_key}. {query}"
        result = collection.query(
            query_embeddings=[self.embedding.embed(combined_query)],
            where={
                "$and": [
                    {"product_id": product_id},
                    {"review_status": "APPROVED"},
                    {"valid_from_ordinal": {"$lte": today_ordinal}},
                    {"valid_to_ordinal": {"$gte": today_ordinal}},
                ]
            },
            n_results=min(top_k, collection.count()),
            include=["documents", "metadatas", "distances"],
        )
        documents = result.get("documents", [[]])[0]
        metadatas = result.get("metadatas", [[]])[0]
        distances = result.get("distances", [[]])[0]
        candidates = [
            self._to_result(content, metadata, distance)
            for content, metadata, distance in zip(documents, metadatas, distances, strict=True)
        ]
        return [document for document in candidates if self._is_trusted_result(document)]

    def _collection(self):
        return self.client.get_or_create_collection(
            self.settings.rag_collection_name,
            metadata={"hnsw:space": "cosine"},
        )

    def _validate(self, document: OfficialDocument) -> None:
        host = (urlparse(str(document.source_url)).hostname or "").lower()
        allowed = any(
            host == domain or host.endswith(f".{domain}")
            for domain in self.settings.source_domain_allowlist
        )
        if not self.settings.source_domain_allowlist or not allowed:
            raise ValueError(f"Source domain is not allowed: {host}")
        if document.valid_to and document.valid_to < datetime.now(UTC).date():
            raise ValueError(f"Expired document cannot be indexed: {document.document_id}")
        if document.valid_from and document.valid_from > datetime.now(UTC).date():
            raise ValueError(f"Not-yet-valid document cannot be indexed: {document.document_id}")

    def _metadata(self, document: OfficialDocument, chunk_index: int) -> dict[str, str | int]:
        return {
            "document_id": document.document_id,
            "institution": document.institution,
            "document_name": document.document_name,
            "source_type": document.source_type,
            "source_url": str(document.source_url),
            "retrieved_at": document.retrieved_at.isoformat(),
            "valid_from": document.valid_from.isoformat() if document.valid_from else "",
            "valid_to": document.valid_to.isoformat() if document.valid_to else "",
            "valid_from_ordinal": document.valid_from.toordinal() if document.valid_from else 1,
            "valid_to_ordinal": document.valid_to.toordinal() if document.valid_to else 9999999,
            "review_status": document.review_status,
            "product_id": document.product_id,
            "language": document.language,
            "content_hash": document.content_hash,
            "rule_keys": ",".join(document.rule_keys),
            "chunk_index": chunk_index,
        }

    def _to_result(self, content: str, metadata: dict, distance: float) -> RetrievedDocument:
        return RetrievedDocument(
            documentId=int(metadata["document_id"]),
            title=str(metadata["document_name"]),
            content=content,
            sourceUrl=str(metadata["source_url"]),
            retrievedAt=str(metadata["retrieved_at"]),
            score=round(max(0.0, min(1.0, 1.0 - float(distance))), 4),
            institution=str(metadata["institution"]),
            sourceType=str(metadata["source_type"]),
            validFrom=str(metadata["valid_from"]) or None,
            validTo=str(metadata["valid_to"]) or None,
            productId=int(metadata["product_id"]),
            language=str(metadata["language"]),
        )

    def _is_trusted_result(self, document: RetrievedDocument) -> bool:
        host = (urlparse(str(document.source_url)).hostname or "").lower()
        domain_allowed = any(
            host == domain or host.endswith(f".{domain}")
            for domain in self.settings.source_domain_allowlist
        )
        today = date.today()
        return (
            domain_allowed
            and (document.valid_from is None or document.valid_from <= today)
            and (document.valid_to is None or document.valid_to >= today)
        )
