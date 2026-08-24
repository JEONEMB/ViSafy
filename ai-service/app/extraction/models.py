from typing import Literal

from pydantic import BaseModel, Field


class RuleExtractionPage(BaseModel):
    page_number: int | None = Field(default=None, alias="pageNumber", ge=1)
    section_name: str | None = Field(default=None, alias="sectionName")
    text: str = Field(min_length=1)


class RuleCandidateExtractionRequest(BaseModel):
    product_code: str = Field(alias="productCode", min_length=1)
    source_document_id: int = Field(alias="sourceDocumentId", gt=0)
    pages: list[RuleExtractionPage] = Field(min_length=1)


class ExtractedRuleCandidate(BaseModel):
    source_document_id: int = Field(alias="sourceDocumentId")
    product_code: str = Field(alias="productCode")
    rule_key: str = Field(alias="ruleKey")
    operator: Literal["EQ", "NE", "IN", "NOT_IN", "GT", "GTE", "LT", "LTE", "EXISTS"]
    value: str
    rule_level: Literal["HARD", "EXTERNAL_CHECK", "UNKNOWN"] = Field(alias="ruleLevel")
    rule_nature: Literal["HARD_ELIGIBILITY", "EXTERNAL_CHECK", "UNKNOWN_ELIGIBILITY"] = Field(alias="ruleNature")
    mandatory: bool
    source_excerpt: str = Field(alias="sourceExcerpt")
    source_locator: str = Field(alias="sourceLocator")
    page_number: int | None = Field(alias="pageNumber")
    section_name: str | None = Field(alias="sectionName")
    confidence: float
    review_status: Literal["PENDING"] = Field(default="PENDING", alias="reviewStatus")

    model_config = {"populate_by_name": True}


class RuleCandidateExtractionResponse(BaseModel):
    candidates: list[ExtractedRuleCandidate]
    warnings: list[str]
