from app.extraction.composite_extractor import CompositeRuleCandidateExtractor
from app.extraction.llm_rule_extractor import LlmRuleCandidateProposer, ProposedRule
from app.extraction.models import RuleCandidateExtractionRequest, RuleExtractionPage

PAGE_TEXT = "가입대상: E-9, F-5 비자 소지자가 신청 가능하며 비자 잔여기간 3개월 이상이어야 합니다."


def request() -> RuleCandidateExtractionRequest:
    return RuleCandidateExtractionRequest(
        productCode="DEMO-LOAN",
        sourceDocumentId=12,
        pages=[{"pageNumber": 3, "sectionName": "가입대상", "text": PAGE_TEXT}],
    )


def page() -> RuleExtractionPage:
    return request().pages[0]


def proposer() -> LlmRuleCandidateProposer:
    return LlmRuleCandidateProposer(_Settings())


class _Settings:
    llm_provider = "openai"
    llm_api_key = "test-key"
    llm_model = "test-model"
    openai_api_key = "test-key"
    openai_model = "test-model"
    openai_reasoning_effort = "low"
    llm_timeout_seconds = 8.0


def proposal(**overrides) -> ProposedRule:
    payload = {
        "ruleKey": "VISA_REMAINING_MONTH",
        "operator": "GTE",
        "value": "3",
        "ruleLevel": "HARD",
        "mandatory": True,
        "sourceExcerpt": PAGE_TEXT,
    }
    payload.update(overrides)
    return ProposedRule.model_validate(payload)


def verify(**overrides):
    return proposer()._verify(request(), page(), proposal(**overrides))


def test_accepts_a_proposal_quoted_verbatim_from_the_page() -> None:
    candidate = verify()

    assert candidate is not None
    assert candidate.rule_key == "VISA_REMAINING_MONTH"
    assert candidate.rule_nature == "HARD_ELIGIBILITY"
    assert candidate.extractor == "LLM_VERIFIED"
    assert candidate.review_status == "PENDING"
    assert candidate.source_locator == "가입대상"


def test_rejects_a_paraphrased_excerpt_that_is_not_in_the_document() -> None:
    assert verify(sourceExcerpt="비자 잔여기간이 3개월 넘게 남아 있어야 신청할 수 있습니다.") is None


def test_rejects_a_value_whose_number_is_absent_from_the_excerpt() -> None:
    assert verify(value="6") is None


def test_rejects_a_value_whose_visa_code_is_absent_from_the_excerpt() -> None:
    assert verify(ruleKey="VISA_TYPE", operator="IN", value='["E-9","F-6"]') is None


def test_accepts_visa_codes_that_appear_in_the_excerpt_and_stores_them_compactly() -> None:
    candidate = verify(ruleKey="VISA_TYPE", operator="IN", value='["E-9", "F-5"]')

    assert candidate is not None
    assert candidate.value == '["E-9","F-5"]'


def test_rejects_a_rule_key_outside_the_allowed_set() -> None:
    assert verify(ruleKey="CREDIT_SCORE") is None


def test_never_accepts_a_foreigner_eligibility_rule_from_the_model() -> None:
    assert verify(ruleKey="FOREIGNER_ALLOWED", operator="EQ", value="true") is None


def test_rejects_an_unsupported_rule_level() -> None:
    assert verify(ruleLevel="SOFT") is None


def test_composite_keeps_rule_based_candidates_when_the_model_is_unavailable() -> None:
    class Disabled:
        enabled = False

        def propose(self, _request):  # pragma: no cover - never called
            raise AssertionError("must not be called when disabled")

    result = CompositeRuleCandidateExtractor(Disabled()).extract(request())

    assert {candidate.rule_key for candidate in result.candidates} == {
        "VISA_TYPE",
        "VISA_REMAINING_MONTH",
    }
    assert all(candidate.extractor == "RULE_BASED" for candidate in result.candidates)
    assert result.llm_attempted is False
    assert any("disabled" in warning for warning in result.warnings)


def test_composite_does_not_duplicate_a_condition_both_extractors_found() -> None:
    duplicate = verify(ruleKey="VISA_REMAINING_MONTH", operator="GTE", value="3")

    class Stub:
        enabled = True

        def propose(self, _request):
            return [duplicate], 2

    result = CompositeRuleCandidateExtractor(Stub()).extract(request())

    keys = [candidate.rule_key for candidate in result.candidates]
    assert keys.count("VISA_REMAINING_MONTH") == 1
    assert result.llm_attempted is True
    assert result.llm_proposed == 0
    assert result.llm_rejected == 2


def test_rejects_a_free_text_value_the_rule_engine_could_never_match() -> None:
    assert verify(ruleKey="RESIDENT_STATUS", operator="EQ", value="국내 거주자") is None


def test_normalizes_a_resident_status_value_the_rule_engine_understands() -> None:
    candidate = verify(ruleKey="RESIDENT_STATUS", operator="EQ", value="non resident")

    assert candidate is not None
    assert candidate.value == "NON_RESIDENT"


def test_rejects_a_non_numeric_value_for_a_numeric_rule_key() -> None:
    assert verify(ruleKey="VISA_REMAINING_MONTH", operator="GTE", value="세 달") is None


def test_rejects_a_visa_type_value_that_is_not_a_list_of_codes() -> None:
    assert verify(ruleKey="VISA_TYPE", operator="IN", value="E-9") is None
