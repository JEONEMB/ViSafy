from datetime import UTC, datetime

from app.guardrail.answer_builder import GUARDRAILS, GroundedAnswerBuilder
from app.rag.models import RagAnswerRequest, RetrievedDocument


def test_answer_keeps_eligibility_result_separate_from_official_evidence() -> None:
    request = RagAnswerRequest(
        productId=10,
        ruleKey="VISA_TYPE",
        query="E-9 가능 여부",
        topK=3,
        eligibilityStatus="NEED_BANK_CONFIRMATION",
        ruleResult="허용 비자 세부목록이 공개되어 있지 않음",
        language="ko",
    )
    evidence = RetrievedDocument(
        documentId=12,
        title="상품설명서",
        content="체류 VISA 유형에 따라 제한될 수 있음",
        sourceUrl="https://www.kbstar.com/product",
        retrievedAt=datetime.now(UTC),
        score=0.91,
        institution="Official Bank",
        sourceType="PRODUCT_DESCRIPTION",
        validFrom=None,
        validTo=None,
        productId=10,
        language="ko",
    )

    answer = GroundedAnswerBuilder().build(request, [evidence])

    assert "NEED_BANK_CONFIRMATION" in answer
    assert "구조화된 Rule 결과" in answer
    assert "공식 근거" in answer
    assert "가입 승인을 보장하지 않습니다" in answer
    assert "ELIGIBILITY_RESULT_IMMUTABLE" in GUARDRAILS
