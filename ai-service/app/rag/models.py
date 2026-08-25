from datetime import date, datetime

from pydantic import BaseModel, Field, HttpUrl


class RetrievalRequest(BaseModel):
    product_id: int = Field(alias="productId", gt=0)
    rule_key: str = Field(alias="ruleKey", min_length=1, max_length=120)
    query: str = Field(min_length=2, max_length=1000)
    top_k: int = Field(default=5, alias="topK", ge=1, le=10)


class RetrievedDocument(BaseModel):
    document_id: int = Field(alias="documentId")
    title: str
    content: str
    source_url: HttpUrl = Field(alias="sourceUrl")
    retrieved_at: datetime = Field(alias="retrievedAt")
    score: float
    institution: str
    source_type: str = Field(alias="sourceType")
    valid_from: date | None = Field(default=None, alias="validFrom")
    valid_to: date | None = Field(default=None, alias="validTo")
    product_id: int = Field(alias="productId")
    language: str

    model_config = {"populate_by_name": True}


class RetrievalResponse(BaseModel):
    documents: list[RetrievedDocument]


class RagAnswerRequest(RetrievalRequest):
    eligibility_status: str = Field(alias="eligibilityStatus", min_length=1, max_length=80)
    rule_result: str = Field(alias="ruleResult", min_length=1, max_length=2000)
    language: str = Field(default="ko", pattern="^(ko|en|vi|zh|ja|th)$")


class RagAnswerResponse(BaseModel):
    answer: str
    eligibility_status: str = Field(alias="eligibilityStatus")
    rule_result: str = Field(alias="ruleResult")
    documents: list[RetrievedDocument]
    guardrails_applied: list[str] = Field(alias="guardrailsApplied")

    model_config = {"populate_by_name": True}
