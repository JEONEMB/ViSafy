from datetime import UTC, date, datetime, timedelta

import pytest

from app.config import Settings
from app.ingestion.models import OfficialDocument
from app.rag.store import OfficialDocumentStore


def document(
    document_id: int,
    product_id: int,
    content: str,
    source_url: str = "https://www.kbstar.com/product",
    valid_from: date | None = None,
    valid_to: date | None = None,
) -> OfficialDocument:
    return OfficialDocument(
        documentId=document_id,
        institution="Official Bank",
        documentName="상품설명서",
        sourceType="PRODUCT_DESCRIPTION",
        sourceUrl=source_url,
        retrievedAt=datetime.now(UTC),
        validFrom=valid_from,
        validTo=valid_to,
        productId=product_id,
        language="ko",
        reviewStatus="APPROVED",
        contentHash=(str(document_id) * 64)[:64],
        content=content,
        ruleKeys=["VISA_TYPE"],
    )


def test_retrieval_never_mixes_other_product_metadata(tmp_path) -> None:
    settings = Settings(
        vector_db_path=str(tmp_path),
        rag_collection_name="test_documents",
        allowed_source_domains="kbstar.com",
        rag_chunk_size=250,
        rag_chunk_overlap=40,
    )
    store = OfficialDocumentStore(settings)
    store.sync(
        [
            document(1, 10, "E-9 비자는 신청할 수 있으며 체류기간 확인이 필요합니다."),
            document(2, 20, "F-5 비자만 신청할 수 있습니다."),
        ]
    )

    results = store.retrieve(10, "VISA_TYPE", "E-9 외국인 체류자격 제한", 5)

    assert results
    assert {result.product_id for result in results} == {10}
    assert {result.document_id for result in results} == {1}


def test_unapproved_domain_is_rejected_before_collection_reset(tmp_path) -> None:
    settings = Settings(
        vector_db_path=str(tmp_path),
        rag_collection_name="test_documents",
        allowed_source_domains="kbstar.com",
    )
    store = OfficialDocumentStore(settings)

    with pytest.raises(ValueError, match="not allowed"):
        store.sync([document(1, 10, "content", "https://example.com/product")])


def test_expired_or_not_yet_valid_source_cannot_be_indexed(tmp_path) -> None:
    settings = Settings(
        vector_db_path=str(tmp_path),
        rag_collection_name="test_documents",
        allowed_source_domains="kbstar.com",
    )
    store = OfficialDocumentStore(settings)

    with pytest.raises(ValueError, match="Expired"):
        store.sync([document(1, 10, "content", valid_to=date.today() - timedelta(days=1))])
    with pytest.raises(ValueError, match="Not-yet-valid"):
        store.sync([document(2, 10, "content", valid_from=date.today() + timedelta(days=1))])
