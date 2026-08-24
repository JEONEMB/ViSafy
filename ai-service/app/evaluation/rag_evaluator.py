import re
from collections import defaultdict
from dataclasses import dataclass

from app.guardrail.answer_builder import NO_EVIDENCE_MESSAGES, GroundedAnswerBuilder
from app.rag.models import RagAnswerRequest
from app.rag.store import OfficialDocumentStore


@dataclass(frozen=True)
class EvaluationCase:
    case_id: str
    group_id: str
    product_id: int
    rule_key: str
    language: str
    query: str
    expected_document_ids: tuple[int, ...]
    structured_values: str = ""
    unsupported: bool = False


class RagEvaluator:
    def __init__(self, store: OfficialDocumentStore, top_k: int = 3) -> None:
        self.store = store
        self.top_k = top_k

    def evaluate(self, cases: list[EvaluationCase]) -> dict:
        evaluated = []
        group_results: dict[str, dict[str, set[int]]] = defaultdict(dict)
        builder = GroundedAnswerBuilder()
        for case in cases:
            documents = self.store.retrieve(case.product_id, case.rule_key, case.query, self.top_k)
            retrieved_ids = [document.document_id for document in documents]
            expected_hit = bool(set(retrieved_ids) & set(case.expected_document_ids))
            contamination = any(document.product_id != case.product_id for document in documents)
            request = RagAnswerRequest(
                productId=case.product_id,
                ruleKey=case.rule_key,
                query=case.query,
                topK=self.top_k,
                eligibilityStatus="INSUFFICIENT_INFORMATION" if case.unsupported else "NEED_BANK_CONFIRMATION",
                ruleResult=case.structured_values or "OFFICIAL_SOURCE_EVALUATION",
                language=case.language,
            )
            answer = builder.build(request, documents)
            numeric_tokens = self._critical_tokens(case.structured_values)
            numeric_integrity = all(token in answer for token in numeric_tokens)
            blocked = not documents and NO_EVIDENCE_MESSAGES[case.language] in answer
            citation_correct = bool(documents) and documents[0].document_id in case.expected_document_ids
            retrieval_precision = (
                len(set(retrieved_ids) & set(case.expected_document_ids)) / len(retrieved_ids)
                if retrieved_ids else 0.0
            )
            group_results[case.group_id][case.language] = set(retrieved_ids)
            evaluated.append({
                "caseId": case.case_id,
                "language": case.language,
                "retrievedDocumentIds": retrieved_ids,
                "topKHit": expected_hit,
                "citationCorrect": citation_correct,
                "topKPrecision": round(retrieval_precision, 4),
                "numericIntegrity": numeric_integrity,
                "unsupportedBlocked": blocked if case.unsupported else None,
                "crossProductContamination": contamination,
            })
        supported = [item for item, case in zip(evaluated, cases, strict=True) if not case.unsupported]
        unsupported = [item for item, case in zip(evaluated, cases, strict=True) if case.unsupported]
        overlaps = self._language_overlaps(group_results)
        return {
            "caseCount": len(cases),
            "topKRecall": self._rate(supported, "topKHit"),
            "citationAccuracy": self._rate(supported, "citationCorrect"),
            "meanTopKPrecision": round(
                sum(item["topKPrecision"] for item in supported) / len(supported), 4
            ) if supported else None,
            "numericIntegrityRate": self._rate(evaluated, "numericIntegrity"),
            "unsupportedAnswerBlockingRate": self._rate(unsupported, "unsupportedBlocked"),
            "crossProductContaminationRate": self._rate(evaluated, "crossProductContamination"),
            "multilingualTopKOverlap": round(sum(overlaps) / len(overlaps), 4) if overlaps else None,
            "cases": evaluated,
        }

    def _language_overlaps(self, groups: dict[str, dict[str, set[int]]]) -> list[float]:
        scores = []
        for languages in groups.values():
            if not {"ko", "en", "vi"}.issubset(languages):
                continue
            sets = [languages[language] for language in ("ko", "en", "vi")]
            union = set.union(*sets)
            intersection = set.intersection(*sets)
            scores.append(len(intersection) / len(union) if union else 1.0)
        return scores

    def _critical_tokens(self, value: str) -> set[str]:
        return set(re.findall(r"\b(?:[A-Z]-\d|\d[\d,]*)\b", value))

    def _rate(self, items: list[dict], key: str) -> float | None:
        if not items:
            return None
        return round(sum(bool(item[key]) for item in items) / len(items), 4)
