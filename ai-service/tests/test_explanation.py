import pytest

from app.explain.builder import ExplanationBuilder
from app.explain.models import ConditionInput, ExplanationRequest
from app.guardrail.answer_builder import DISCLAIMERS


def request(language: str = "ko", status: str = "NEED_BANK_CONFIRMATION") -> ExplanationRequest:
    return ExplanationRequest(
        productId=10,
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
        ruleDetails=[
            {
                "key": "VISA_TYPE",
                "messageCode": "RULE_PASSED",
                "actualValue": "E-9",
                "expectedValue": '["E-9"]',
                "sourceExcerpt": "E-9 체류자격",
                "sourceLocator": "p.3",
                "sourceUrl": "https://official.example/product",
            }
        ],
        termKeys=["STATUS_OF_STAY", "PROOF_OF_INCOME", "GUARANTEE_INSURANCE_CERTIFICATE"],
        accessResult={
            "status": "ACCESS_READY_BRANCH_ONLY",
            "identification": "AVAILABLE",
            "branch": "AVAILABLE",
            "online": "UNKNOWN",
            "details": [],
            "realNameGuardrailApplied": False,
        },
    )


@pytest.mark.parametrize("language", ["ko", "en", "vi", "zh", "ja", "th"])
def test_explanation_and_inquiry_preserve_structured_numbers_and_visa(language: str) -> None:
    result = ExplanationBuilder().build(request(language))

    assert result.inquiry is not None
    assert "E-9" in result.inquiry.localized
    assert "14" in result.inquiry.localized
    assert "24" in result.inquiry.localized
    assert result.inquiry.korean.startswith("안녕하세요")
    assert result.inquiry.confirmation_items
    assert len(result.easy_terms) == 3
    assert "NO_APPROVAL_GUARANTEE" in result.guardrails_applied
    assert result.next_actions


def test_met_result_never_claims_the_user_can_enroll_and_needs_no_inquiry() -> None:
    payload = request(status="PUBLIC_CONDITIONS_MET")
    payload.external_conditions = []
    payload.unknown_conditions = []

    result = ExplanationBuilder().build(payload)

    assert "가입할 수 있습니다" not in result.explanation
    assert result.disclaimer == DISCLAIMERS["ko"]
    assert result.inquiry is None


def test_general_product_without_visa_rule_never_invents_visa_sentence() -> None:
    payload = request(language="en")
    payload.visa_type = None
    payload.visa_remaining_months = None
    payload.residency_months = None
    payload.external_conditions = [ConditionInput(key="MOBILE_CHANNEL", messageCode="EXTERNAL_CHECK")]
    payload.unknown_conditions = []
    payload.term_keys = []

    result = ExplanationBuilder().build(payload)

    assert result.inquiry is not None
    assert "None" not in result.inquiry.localized
    assert "visa" not in result.inquiry.localized.lower()
    assert "status of stay" not in result.inquiry.localized.lower()
    assert "NO_UNSOURCED_VISA_RULE" in result.guardrails_applied


@pytest.mark.parametrize(
    ("language", "marker"),
    [("zh", "停留资格"), ("ja", "在留資格"), ("th", "สถานะการพำนัก")],
)
def test_added_languages_do_not_fall_back_to_english(language: str, marker: str) -> None:
    result = ExplanationBuilder().build(request(language))

    assert result.disclaimer == DISCLAIMERS[language]
    assert marker in {term.localized_term for term in result.easy_terms}
    for text in [result.explanation, *result.next_actions]:
        assert not text.isascii()


@pytest.mark.parametrize("language", ["ko", "en", "vi", "zh", "ja", "th"])
def test_inquiry_asks_and_never_claims_a_condition_is_met(language: str) -> None:
    """The inquiry is read out at a bank counter, so it must not assert eligibility."""
    result = ExplanationBuilder().build(request(language))

    assert result.inquiry is not None
    claims = ["충족했습니다", "충족합니다", "가입 가능합니다", "자격이 있습니다"]
    for claim in claims:
        assert claim not in result.inquiry.korean
        assert claim not in result.inquiry.localized
