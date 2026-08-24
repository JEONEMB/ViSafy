from typing import Literal

from pydantic import BaseModel, Field

EligibilityStatus = Literal[
    "PUBLIC_CONDITIONS_MET",
    "NEED_BANK_CONFIRMATION",
    "PUBLIC_CONDITIONS_NOT_MET",
    "INSUFFICIENT_INFORMATION",
]


class ConditionInput(BaseModel):
    key: str = Field(min_length=1, max_length=120)
    message_code: str = Field(alias="messageCode", min_length=1, max_length=120)
    actual_value: str | None = Field(default=None, alias="actualValue", max_length=2000)
    expected_value: str | None = Field(default=None, alias="expectedValue", max_length=2000)
    source_excerpt: str | None = Field(default=None, alias="sourceExcerpt", max_length=10000)
    source_locator: str | None = Field(default=None, alias="sourceLocator", max_length=1000)
    source_url: str | None = Field(default=None, alias="sourceUrl", max_length=2000)


class ExplanationRequest(BaseModel):
    eligibility_status: EligibilityStatus = Field(alias="eligibilityStatus")
    language: Literal["ko", "en", "vi"]
    product_name: str = Field(alias="productName", min_length=1, max_length=500)
    institution: str = Field(min_length=1, max_length=120)
    visa_type: str | None = Field(default=None, alias="visaType", min_length=1, max_length=10)
    visa_remaining_months: int | None = Field(default=None, alias="visaRemainingMonths", ge=0, le=1200)
    residency_months: int | None = Field(default=None, alias="residencyMonths", ge=0, le=1200)
    passed_count: int = Field(alias="passedCount", ge=0, le=1000)
    failed_count: int = Field(alias="failedCount", ge=0, le=1000)
    external_conditions: list[ConditionInput] = Field(alias="externalConditions")
    unknown_conditions: list[ConditionInput] = Field(alias="unknownConditions")
    rule_details: list[ConditionInput] = Field(alias="ruleDetails", max_length=1000)
    term_keys: list[str] = Field(alias="termKeys", max_length=30)


class EasyTerm(BaseModel):
    key: str
    korean_term: str = Field(alias="koreanTerm")
    localized_term: str = Field(alias="localizedTerm")
    explanation: str

    model_config = {"populate_by_name": True}


class BankInquiry(BaseModel):
    korean: str
    localized: str
    language: Literal["ko", "en", "vi"]
    confirmation_items: list[str] = Field(alias="confirmationItems")

    model_config = {"populate_by_name": True}


class ExplanationResponse(BaseModel):
    explanation: str
    disclaimer: str
    easy_terms: list[EasyTerm] = Field(alias="easyTerms")
    inquiry: BankInquiry | None
    guardrails_applied: list[str] = Field(alias="guardrailsApplied")

    model_config = {"populate_by_name": True}
