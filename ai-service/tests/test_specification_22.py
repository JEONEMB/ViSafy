import re
from datetime import UTC, datetime

from app.guardrail.answer_builder import GroundedAnswerBuilder
from app.rag.models import RagAnswerRequest, RetrievedDocument


def request(language: str, rule_result: str = "VISA_DETAIL=UNKNOWN") -> RagAnswerRequest:
    return RagAnswerRequest(
        productId=10,
        ruleKey="VISA_DETAIL",
        query="체류자격 제한 조건",
        topK=3,
        eligibilityStatus="NEED_BANK_CONFIRMATION",
        ruleResult=rule_result,
        language=language,
    )


def evidence(content: str, title: str = "KB Official Product Guide") -> RetrievedDocument:
    return RetrievedDocument(
        documentId=101,
        title=title,
        content=content,
        sourceUrl="https://www.kbstar.com/product/foreign-customer",
        retrievedAt=datetime.now(UTC),
        score=0.97,
        institution="KB Bank",
        sourceType="PRODUCT_DESCRIPTION",
        validFrom=None,
        validTo=None,
        productId=10,
        language="ko",
    )


def test103_answer_does_not_invent_conditions_absent_from_context() -> None:
    answer = GroundedAnswerBuilder().build(
        request("ko"),
        [evidence("체류 VISA 유형에 따라 제한될 수 있음")],
    )

    assert "체류 VISA 유형에 따라 제한될 수 있음" in answer
    assert "F-5" not in answer
    assert "3000000" not in answer
    assert "12개월" not in answer


def test104_and_test110_multilingual_outputs_preserve_structured_values_and_source() -> None:
    structured = "VISA_TYPE=E-9; VISA_REMAINING_MONTH=3; MONTHLY_INCOME=3000000 KRW"
    source_title = "KB Official Product Guide"
    context = evidence("공식 최소 비자 잔여기간은 3개월입니다.", source_title)

    answers = {
        language: GroundedAnswerBuilder().build(request(language, structured), [context])
        for language in ("ko", "en", "vi")
    }

    for answer in answers.values():
        assert "NEED_BANK_CONFIRMATION" in answer
        assert "E-9" in answer
        assert "3" in answer
        assert "3000000" in answer
        assert source_title in answer

    numeric_tokens = {
        language: re.findall(r"(?<![A-Za-z])-?\d+(?![A-Za-z])", answer)
        for language, answer in answers.items()
    }
    assert numeric_tokens["ko"] == numeric_tokens["en"] == numeric_tokens["vi"]
