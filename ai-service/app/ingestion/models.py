from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field, HttpUrl

OfficialSourceType = Literal[
    "PRODUCT_PAGE",
    "PRODUCT_DESCRIPTION",
    "TERMS",
    "FAQ",
    "PUBLIC_GUIDE",
]


class OfficialDocument(BaseModel):
    document_id: int = Field(alias="documentId")
    institution: str = Field(min_length=1, max_length=120)
    document_name: str = Field(alias="documentName", min_length=1, max_length=500)
    source_type: OfficialSourceType = Field(alias="sourceType")
    source_url: HttpUrl = Field(alias="sourceUrl")
    retrieved_at: datetime = Field(alias="retrievedAt")
    valid_from: date | None = Field(default=None, alias="validFrom")
    valid_to: date | None = Field(default=None, alias="validTo")
    product_id: int = Field(alias="productId", gt=0)
    language: Literal["ko", "en", "vi"]
    review_status: Literal["APPROVED"] = Field(alias="reviewStatus")
    content_hash: str = Field(alias="contentHash", min_length=64, max_length=64)
    content: str = Field(min_length=1)
    rule_keys: list[str] = Field(default_factory=list, alias="ruleKeys")


class SyncDocumentsRequest(BaseModel):
    documents: list[OfficialDocument]


class SyncDocumentsResponse(BaseModel):
    indexed_documents: int = Field(alias="indexedDocuments")
    indexed_chunks: int = Field(alias="indexedChunks")

    model_config = {"populate_by_name": True}
