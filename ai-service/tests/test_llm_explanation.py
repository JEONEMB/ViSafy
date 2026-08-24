from app.config import Settings
from app.explain.llm import OpenAIExplanationEnhancer
from app.explain.models import ExplanationRequest


def request() -> ExplanationRequest:
    return ExplanationRequest.model_validate({
        "eligibilityStatus": "PUBLIC_CONDITIONS_MET",
        "language": "ko",
        "productName": "공식 적금",
        "institution": "공식은행",
        "passedCount": 1,
        "failedCount": 0,
        "externalConditions": [],
        "unknownConditions": [],
        "ruleDetails": [{
            "key": "DESIRED_MONTHLY_AMOUNT",
            "messageCode": "RULE_PASSED",
            "actualValue": "300000",
            "expectedValue": "10000",
            "sourceExcerpt": "월 1만원 이상",
        }],
        "termKeys": [],
    })


def test_openai_is_disabled_without_secret_and_model() -> None:
    enhancer = OpenAIExplanationEnhancer(Settings(llm_provider="openai"))
    assert enhancer.enabled is False


def test_numeric_guardrail_rejects_unsourced_number() -> None:
    enhancer = OpenAIExplanationEnhancer(Settings())
    assert enhancer._structured_values_preserved(request(), "월 300000원 조건을 확인했습니다.")
    assert not enhancer._structured_values_preserved(request(), "월 500000원 조건을 확인했습니다.")
