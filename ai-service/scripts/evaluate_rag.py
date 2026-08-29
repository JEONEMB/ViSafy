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


# Mirrors app.source.allowed-domains in backend/src/main/resources/application.yml, so the
# evaluation applies the same official-domain guard the runtime does.
ALLOWED_SOURCE_DOMAINS = (
    "kbstar.com,kebhana.com,hanabank.com,shinhan.com,kbsec.com,wooribank.com,ibk.co.kr,"
    "nhbank.com,kdb.co.kr,sc.co.kr,citibank.co.kr,kakaobank.com,kbanknow.com,tossbank.com,"
    "fss.or.kr,fsc.go.kr,finlife.fss.or.kr"
)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", default="evaluation/rag_eval_dataset.json")
    parser.add_argument("--output", default=None, help="Write the JSON report to this path.")
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
            allowed_source_domains=ALLOWED_SOURCE_DOMAINS,
        )
        store = OfficialDocumentStore(settings)
        store.sync([fixture(item) for item in payload["documents"]])
        report = RagEvaluator(store).evaluate(cases)
        rendered = json.dumps(report, ensure_ascii=False, indent=2)
        if args.output:
            Path(args.output).write_text(rendered, encoding="utf-8")
        print(rendered)


if __name__ == "__main__":
    main()
