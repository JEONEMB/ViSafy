import json
from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import patch

import pytest
from pydantic import ValidationError

from app.config import Settings
from app.explain.builder import ExplanationBuilder
from app.explain.llm import GeneratedExplanation, OpenAIExplanationEnhancer
from app.explain.models import ExplanationRequest
from app.api.explanation import _retrieve_context
from app.rag.models import RetrievedDocument


def request() -> ExplanationRequest:
    return ExplanationRequest.model_validate({
        "productId": 10,
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
        "accessResult": {
            "status": "ACCESS_UNKNOWN",
            "identification": "UNKNOWN",
            "branch": "UNKNOWN",
            "online": "UNKNOWN",
            "details": [],
            "realNameGuardrailApplied": False,
        },
        "ragContext": [{
            "documentId": 4,
            "title": "공식 상품설명서",
            "content": "월 납입 조건은 공식 설명서에 따릅니다.",
            "sourceUrl": "https://official.example/product",
            "retrievedAt": "2026-08-24T00:00:00Z",
            "score": 0.9,
        }],
    })


def test_openai_is_disabled_without_secret_and_model() -> None:
    enhancer = OpenAIExplanationEnhancer(Settings(llm_provider="openai"))
    assert enhancer.enabled is False


def test_numeric_guardrail_rejects_unsourced_number() -> None:
    enhancer = OpenAIExplanationEnhancer(Settings())
    assert enhancer._structured_values_preserved(request(), "월 300000원 조건을 확인했습니다.")
    assert not enhancer._structured_values_preserved(request(), "월 500000원 조건을 확인했습니다.")


def test_responses_api_structured_output_enhances_only_presentation_fields() -> None:
    payload = request()
    fallback = ExplanationBuilder().build(payload)
    generated = {
        "easyExplanation": "공식 근거를 바탕으로 공개조건을 쉽게 설명했습니다.",
        "nextActions": ["공식 신청 경로를 확인하세요."],
        "bankInquiry": None,
    }
    calls = []

    class FakeResponses:
        def create(self, **kwargs):
            calls.append(kwargs)
            return SimpleNamespace(output_text=json.dumps(generated, ensure_ascii=False))

    class FakeOpenAI:
        def __init__(self, **kwargs):
            self.responses = FakeResponses()

    settings = Settings(
        llm_provider="openai",
        openai_api_key="test-only-key",
        openai_model="gpt-5.6-terra",
        openai_reasoning_effort="medium",
    )
    with patch("app.explain.llm.OpenAI", FakeOpenAI):
        result = OpenAIExplanationEnhancer(settings).enhance(payload, fallback)

    assert result.explanation == generated["easyExplanation"]
    assert result.next_actions == generated["nextActions"]
    assert result.disclaimer == fallback.disclaimer
    assert "OPENAI_RESPONSES_API" in result.guardrails_applied
    assert calls[0]["model"] == "gpt-5.6-terra"
    assert calls[0]["reasoning"] == {"effort": "medium"}
    assert calls[0]["store"] is False
    assert calls[0]["text"]["format"]["type"] == "json_schema"
    assert "officialRagContext" in calls[0]["input"]
    assert "accessResult" in calls[0]["input"]


def test_openai_failure_keeps_deterministic_fallback() -> None:
    payload = request()
    fallback = ExplanationBuilder().build(payload)

    class FailingOpenAI:
        def __init__(self, **kwargs):
            raise RuntimeError("network unavailable")

    settings = Settings(llm_provider="openai", openai_api_key="test-only-key")
    with patch("app.explain.llm.OpenAI", FailingOpenAI):
        result = OpenAIExplanationEnhancer(settings).enhance(payload, fallback)

    assert result == fallback


def test_llm_output_schema_rejects_status_override_fields() -> None:
    with pytest.raises(ValidationError):
        GeneratedExplanation.model_validate({
            "easyExplanation": "설명",
            "nextActions": ["확인하세요."],
            "bankInquiry": None,
            "eligibilityStatus": "PUBLIC_CONDITIONS_MET",
        })


def test_generated_text_cannot_echo_or_replace_immutable_statuses() -> None:
    payload = request()
    generated = GeneratedExplanation.model_validate({
        "easyExplanation": "ACCESS_READY로 바꿨습니다.",
        "nextActions": ["확인하세요."],
        "bankInquiry": None,
    })

    assert not OpenAIExplanationEnhancer(Settings())._generated_output_is_safe(payload, generated)


def test_retrieved_pydantic_values_are_serialized_for_explanation_context() -> None:
    class Store:
        def retrieve(self, product_id, rule_key, query, top_k):
            return [RetrievedDocument(
                documentId=7, title="Official guide", content="Official condition",
                sourceUrl="https://www.kbstar.com/guide", retrievedAt=datetime.now(UTC),
                score=0.9, institution="KB", sourceType="PRODUCT_PAGE",
                validFrom=None, validTo=None, productId=product_id, language="ko",
            )]

    context = _retrieve_context(request(), Store())

    assert len(context) == 1
    assert context[0].source_url == "https://www.kbstar.com/guide"
    assert isinstance(context[0].retrieved_at, str)
