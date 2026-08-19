import pytest

from app.explain.builder import ExplanationBuilder
from app.explain.models import ExplanationRequest


def request(language: str = "ko", status: str = "NEED_BANK_CONFIRMATION") -> ExplanationRequest:
    return ExplanationRequest(
        eligibilityStatus=status,
        language=language,
        productName="A 외국인 전세대출",
        institution="A 은행",
        visaType="E-9",
        visaRemainingMonths=14,
        residencyMonths=24,
        passedCount=4,
        failedCount=0,
        externalConditions=[{"key": "GUARANTEE", "messageCode": "EXTERNAL_CHECK"}],
        unknownConditions=[{"key": "VISA_DETAIL", "messageCode": "UNKNOWN"}],
        termKeys=["STATUS_OF_STAY", "PROOF_OF_INCOME", "GUARANTEE_INSURANCE_CERTIFICATE"],
    )


@pytest.mark.parametrize("language", ["ko", "en", "vi"])
def test_explanation_and_inquiry_preserve_structured_numbers_and_visa(language: str) -> None:
    result = ExplanationBuilder().build(request(language))

    assert result.inquiry is not None
    assert "E-9" in result.inquiry.localized
    assert "14" in result.inquiry.localized
    assert "24" in result.inquiry.localized
    assert result.inquiry.korean.startswith("안녕하세요")
    assert len(result.easy_terms) == 3
    assert "NO_APPROVAL_GUARANTEE" in result.guardrails_applied


def test_met_result_never_claims_the_user_can_enroll_and_needs_no_inquiry() -> None:
    payload = request(status="PUBLIC_CONDITIONS_MET")
    payload.external_conditions = []
    payload.unknown_conditions = []

    result = ExplanationBuilder().build(payload)

    assert "가입할 수 있습니다" not in result.explanation
    assert "가입이나 승인을 보장하지 않습니다" in result.disclaimer
    assert result.inquiry is None
