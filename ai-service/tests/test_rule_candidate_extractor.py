from app.extraction.models import RuleCandidateExtractionRequest
from app.extraction.rule_candidate_extractor import ConservativeRuleCandidateExtractor


def test_explicit_rules_include_evidence_locator_and_stay_pending() -> None:
    request = RuleCandidateExtractionRequest(
        productCode="DEMO-LOAN", sourceDocumentId=12,
        pages=[{"pageNumber": 3, "sectionName": "가입대상", "text": "E-9, F-5 비자는 신청 가능하며 비자 잔여기간 3개월 이상이어야 합니다."}],
    )

    result = ConservativeRuleCandidateExtractor().extract(request)

    assert {candidate.rule_key for candidate in result.candidates} == {"VISA_TYPE", "VISA_REMAINING_MONTH"}
    assert all(candidate.review_status == "PENDING" for candidate in result.candidates)
    assert all(candidate.source_excerpt and candidate.source_locator for candidate in result.candidates)
    assert all(candidate.page_number == 3 for candidate in result.candidates)


def test_real_name_individual_never_creates_foreigner_allowed_candidate() -> None:
    request = RuleCandidateExtractionRequest(
        productCode="GENERAL-SAVINGS", sourceDocumentId=20,
        pages=[{"pageNumber": 1, "text": "가입대상은 실명의 개인입니다."}],
    )

    result = ConservativeRuleCandidateExtractor().extract(request)

    assert result.candidates == []
    assert any("실명의 개인" in warning for warning in result.warnings)
