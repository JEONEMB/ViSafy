import json
import math
import re
import sqlite3
from datetime import UTC, date, datetime
from pathlib import Path
from urllib.parse import urlparse

from app.config import Settings
from app.ingestion.models import OfficialDocument
from app.ingestion.text_processor import FinancialDocumentProcessor
from app.rag.embedding import EmbeddingProvider, create_embedding_provider
from app.rag.models import RetrievedDocument


class OfficialDocumentStore:
    """Small local vector store with an explicit official-source trust boundary."""

    def __init__(self, settings: Settings, embedding: EmbeddingProvider | None = None) -> None:
        self.settings = settings
        self.processor = FinancialDocumentProcessor(
            settings.rag_chunk_size, settings.rag_chunk_overlap
        )
        self.embedding = embedding or create_embedding_provider(settings)
        directory = Path(settings.vector_db_path)
        directory.mkdir(parents=True, exist_ok=True)
        safe_collection = re.sub(r"[^a-zA-Z0-9_-]", "_", settings.rag_collection_name)
        self.database_path = directory / f"{safe_collection}.sqlite3"
        self._initialize()

    def sync(self, documents: list[OfficialDocument]) -> tuple[int, int]:
        for document in documents:
            self._validate(document)
        indexed_documents = 0
        indexed_chunks = 0
        rows: list[tuple] = []
        for document in documents:
            chunks = self.processor.chunk(document.content)
            if not chunks:
                continue
            for index, chunk in enumerate(chunks):
                metadata = self._metadata(document)
                rows.append(
                    (
                        f"{document.document_id}:{document.product_id}:{index}",
                        chunk,
                        json.dumps(self.embedding.embed_document(chunk)),
                        metadata["document_id"], metadata["institution"],
                        metadata["document_name"], metadata["source_type"],
                        metadata["source_url"], metadata["retrieved_at"],
                        metadata["valid_from"], metadata["valid_to"],
                        metadata["valid_from_ordinal"], metadata["valid_to_ordinal"],
                        metadata["review_status"], metadata["product_id"], metadata["language"],
                    )
                )
            indexed_documents += 1
            indexed_chunks += len(chunks)
        with self._connect() as connection:
            connection.execute("DELETE FROM chunks")
            connection.executemany(
                """
                INSERT INTO chunks (
                    chunk_id, content, embedding, document_id, institution, document_name,
                    source_type, source_url, retrieved_at, valid_from, valid_to,
                    valid_from_ordinal, valid_to_ordinal, review_status, product_id, language
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                rows,
            )
        return indexed_documents, indexed_chunks

    def retrieve(
        self, product_id: int, rule_key: str, query: str, top_k: int
    ) -> list[RetrievedDocument]:
        today_ordinal = date.today().toordinal()
        query_vector = self.embedding.embed_query(f"Rule {rule_key}. {query}")
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT content, embedding, document_id, institution, document_name, source_type,
                       source_url, retrieved_at, valid_from, valid_to, product_id, language
                FROM chunks
                WHERE product_id = ? AND review_status = 'APPROVED'
                  AND valid_from_ordinal <= ? AND valid_to_ordinal >= ?
                """,
                (product_id, today_ordinal, today_ordinal),
            ).fetchall()
        ranked = sorted(
            ((self._cosine(query_vector, json.loads(row["embedding"])), row) for row in rows),
            key=lambda item: item[0], reverse=True,
        )[:top_k]
        candidates = [self._to_result(row, score) for score, row in ranked]
        return [document for document in candidates if self._is_trusted_result(document)]

    def _initialize(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS chunks (
                    chunk_id TEXT PRIMARY KEY, content TEXT NOT NULL, embedding TEXT NOT NULL,
                    document_id INTEGER NOT NULL, institution TEXT NOT NULL,
                    document_name TEXT NOT NULL, source_type TEXT NOT NULL,
                    source_url TEXT NOT NULL, retrieved_at TEXT NOT NULL,
                    valid_from TEXT NOT NULL, valid_to TEXT NOT NULL,
                    valid_from_ordinal INTEGER NOT NULL, valid_to_ordinal INTEGER NOT NULL,
                    review_status TEXT NOT NULL, product_id INTEGER NOT NULL, language TEXT NOT NULL
                )
                """
            )
            connection.execute(
                "CREATE INDEX IF NOT EXISTS idx_chunks_product_trust "
                "ON chunks(product_id, review_status, valid_from_ordinal, valid_to_ordinal)"
            )

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path, timeout=10)
        connection.row_factory = sqlite3.Row
        return connection

    def _validate(self, document: OfficialDocument) -> None:
        host = (urlparse(str(document.source_url)).hostname or "").lower()
        allowed = any(
            host == domain or host.endswith(f".{domain}")
            for domain in self.settings.source_domain_allowlist
        )
        if not self.settings.source_domain_allowlist or not allowed:
            raise ValueError(f"Source domain is not allowed: {host}")
        if document.review_status != "APPROVED":
            raise ValueError(f"Unapproved document cannot be indexed: {document.document_id}")
        if document.valid_to and document.valid_to < datetime.now(UTC).date():
            raise ValueError(f"Expired document cannot be indexed: {document.document_id}")
        if document.valid_from and document.valid_from > datetime.now(UTC).date():
            raise ValueError(f"Not-yet-valid document cannot be indexed: {document.document_id}")

    def _metadata(self, document: OfficialDocument) -> dict[str, str | int]:
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
        }

    def _to_result(self, row: sqlite3.Row, score: float) -> RetrievedDocument:
        return RetrievedDocument(
            documentId=int(row["document_id"]), title=str(row["document_name"]),
            content=str(row["content"]), sourceUrl=str(row["source_url"]),
            retrievedAt=str(row["retrieved_at"]), score=round(max(0.0, min(1.0, score)), 4),
            institution=str(row["institution"]), sourceType=str(row["source_type"]),
            validFrom=str(row["valid_from"]) or None, validTo=str(row["valid_to"]) or None,
            productId=int(row["product_id"]), language=str(row["language"]),
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

    @staticmethod
    def _cosine(left: list[float], right: list[float]) -> float:
        if len(left) != len(right):
            return 0.0
        left_norm = math.sqrt(sum(value * value for value in left))
        right_norm = math.sqrt(sum(value * value for value in right))
        if left_norm == 0 or right_norm == 0:
            return 0.0
        return sum(a * b for a, b in zip(left, right, strict=True)) / (left_norm * right_norm)
