import argparse
import json
import tempfile
from datetime import UTC, datetime
from pathlib import Path

from app.config import Settings
from app.evaluation.rag_evaluator import EvaluationCase, RagEvaluator
from app.ingestion.models import OfficialDocument
from app.rag.store import OfficialDocumentStore


def fixture(item: dict) -> OfficialDocument:
    return OfficialDocument(
        documentId=item["documentId"],
        institution=item["institution"],
        documentName=item["title"],
        sourceType=item["sourceType"],
        sourceUrl=item["sourceUrl"],
        retrievedAt=datetime.now(UTC),
        productId=item["productId"],
        language="ko",
        reviewStatus="APPROVED",
        contentHash=f'{item["documentId"]:064x}'[-64:],
        content=item["content"],
        ruleKeys=[],
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", default="evaluation/rag_eval_dataset.json")
    args = parser.parse_args()
    payload = json.loads(Path(args.dataset).read_text(encoding="utf-8"))
    cases = [
        EvaluationCase(
            case_id=item["caseId"],
            group_id=item["groupId"],
            product_id=item["productId"],
            rule_key=item["ruleKey"],
            language=item["language"],
            query=item["query"],
            expected_document_ids=tuple(item["expectedDocumentIds"]),
            structured_values=item.get("structuredValues", ""),
            unsupported=item.get("unsupported", False),
        )
        for item in payload["cases"]
    ]
    with tempfile.TemporaryDirectory() as directory:
        settings = Settings(
            vector_db_path=directory,
            rag_collection_name="evaluation",
            allowed_source_domains="kbstar.com,shinhan.com,kebhana.com",
        )
        store = OfficialDocumentStore(settings)
        store.sync([fixture(item) for item in payload["documents"]])
        print(json.dumps(RagEvaluator(store).evaluate(cases), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
