from datetime import UTC, datetime

from app.config import Settings
from app.evaluation.rag_evaluator import EvaluationCase, RagEvaluator
from app.ingestion.models import OfficialDocument
from app.rag.store import OfficialDocumentStore


def test_evaluator_measures_recall_integrity_blocking_and_product_isolation(tmp_path) -> None:
    settings = Settings(vector_db_path=str(tmp_path), rag_collection_name="evaluation", allowed_source_domains="kbstar.com", embedding_provider="hash")
    store = OfficialDocumentStore(settings)
    store.sync([OfficialDocument(
        documentId=1, institution="KB", documentName="Guide", sourceType="PRODUCT_DESCRIPTION",
        sourceUrl="https://www.kbstar.com/guide", retrievedAt=datetime.now(UTC), productId=10,
        language="ko", reviewStatus="APPROVED", contentHash="1" * 64,
        content="E-9 비자의 잔여기간은 3개월 이상입니다.", ruleKeys=["VISA_TYPE"],
    )])
    cases = [
        EvaluationCase("supported", "visa", 10, "VISA_TYPE", "ko", "E-9 비자 3개월", (1,), "VISA_TYPE=E-9; MONTH=3"),
        EvaluationCase("unsupported", "none", 999, "UNKNOWN", "ko", "근거 없음", (), unsupported=True),
    ]

    report = RagEvaluator(store).evaluate(cases)

    assert report["topKRecall"] == 1.0
    assert report["citationAccuracy"] == 1.0
    assert report["numericIntegrityRate"] == 1.0
    assert report["unsupportedAnswerBlockingRate"] == 1.0
    assert report["crossProductContaminationRate"] == 0.0


def test_multilingual_overlap_scores_only_groups_asked_in_every_supported_language(tmp_path) -> None:
    settings = Settings(vector_db_path=str(tmp_path), rag_collection_name="overlap", allowed_source_domains="kbstar.com", embedding_provider="hash")
    store = OfficialDocumentStore(settings)
    store.sync([OfficialDocument(
        documentId=1, institution="KB", documentName="Guide", sourceType="PRODUCT_DESCRIPTION",
        sourceUrl="https://www.kbstar.com/guide", retrievedAt=datetime.now(UTC), productId=10,
        language="ko", reviewStatus="APPROVED", contentHash="1" * 64,
        content="E-9 비자의 잔여기간은 3개월 이상입니다.", ruleKeys=["VISA_TYPE"],
    )])
    six = [
        EvaluationCase(f"all-{language}", "all-six", 10, "VISA_TYPE", language, "E-9 비자", (1,))
        for language in ("ko", "en", "vi", "zh", "ja", "th")
    ]
    partial = [
        EvaluationCase(f"part-{language}", "three-only", 10, "VISA_TYPE", language, "E-9 비자", (1,))
        for language in ("ko", "en", "vi")
    ]

    report = RagEvaluator(store).evaluate(six + partial)

    # The three-language group is ignored, so partial translation cannot inflate the score.
    assert report["multilingualGroupsScored"] == 1
    assert report["multilingualTopKOverlap"] == 1.0
    assert set(report["byLanguage"]) == {"ko", "en", "vi", "zh", "ja", "th"}
    assert report["byProduct"]["10"]["caseCount"] == 9
