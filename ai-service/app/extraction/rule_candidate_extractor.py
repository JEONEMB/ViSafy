import json
import re

from app.extraction.models import (
    ExtractedRuleCandidate,
    RuleCandidateExtractionRequest,
    RuleCandidateExtractionResponse,
    RuleExtractionPage,
)


class ConservativeRuleCandidateExtractor:
    """Extracts only explicit, reviewable candidates; it never approves Runtime rules."""

    VISA_CODE = re.compile(r"\b(?:D-[24]|E-[79]|F-[256])\b", re.IGNORECASE)
    AGE = re.compile(r"(?:만\s*)?(\d{1,3})\s*세\s*(?:이상|부터)|(?:age\s*)?(\d{1,3})\s*(?:or older|and above)", re.IGNORECASE)
    VISA_MONTHS = re.compile(r"(?:비자|체류기간|체류자격)[^\n.]{0,40}?(\d+)\s*개월\s*이상|visa[^\n.]{0,40}?(\d+)\s*months?\s*(?:remaining|or more)", re.IGNORECASE)
    EMPLOYMENT_MONTHS = re.compile(r"(?:재직|근속)[^\n.]{0,30}?(\d+)\s*개월\s*이상|employment[^\n.]{0,30}?(\d+)\s*months?", re.IGNORECASE)

    def extract(self, request: RuleCandidateExtractionRequest) -> RuleCandidateExtractionResponse:
        candidates: list[ExtractedRuleCandidate] = []
        for page in request.pages:
            candidates.extend(self._from_page(request, page))
        return RuleCandidateExtractionResponse(
            candidates=self._deduplicate(candidates),
            warnings=[
                "Candidates are PENDING and must be reviewed by an administrator.",
                "The phrase '실명의 개인' alone never creates a FOREIGNER_ALLOWED rule.",
            ],
        )

    def _from_page(self, request: RuleCandidateExtractionRequest, page: RuleExtractionPage) -> list[ExtractedRuleCandidate]:
        results: list[ExtractedRuleCandidate] = []
        for sentence in self._sentences(page.text):
            codes = sorted({code.upper() for code in self.VISA_CODE.findall(sentence)})
            if codes and self._explicit_visa_condition(sentence):
                operator = "NOT_IN" if re.search(r"제외|불가|제한|except|not eligible", sentence, re.IGNORECASE) else "IN"
                results.append(self._candidate(request, page, sentence, "VISA_TYPE", operator, json.dumps(codes), 0.88))
            for pattern, key in ((self.AGE, "AGE"), (self.VISA_MONTHS, "VISA_REMAINING_MONTH"), (self.EMPLOYMENT_MONTHS, "EMPLOYMENT_DURATION_MONTHS")):
                match = pattern.search(sentence)
                if match:
                    value = next(group for group in match.groups() if group is not None)
                    results.append(self._candidate(request, page, sentence, key, "GTE", value, 0.84))
            if re.search(r"은행\s*내부\s*(?:심사|신용평가)|보증보험|internal\s+(?:review|credit assessment)|guarantee insurance", sentence, re.IGNORECASE):
                results.append(self._candidate(request, page, sentence, "BANK_INTERNAL_REVIEW", "EXISTS", "true", 0.72, "EXTERNAL_CHECK", "EXTERNAL_CHECK"))
            if re.search(r"비자[^\n.]{0,30}(?:제한될 수|세부.*공개.*않)|visa[^\n.]{0,30}(?:may be restricted|details? not disclosed)", sentence, re.IGNORECASE) and not codes:
                results.append(self._candidate(request, page, sentence, "VISA_DETAIL", "EXISTS", "true", 0.70, "UNKNOWN", "UNKNOWN_ELIGIBILITY"))
        return results

    def _candidate(self, request, page, sentence, key, operator, value, confidence, level="HARD", nature="HARD_ELIGIBILITY") -> ExtractedRuleCandidate:
        locator = page.section_name or (f"PDF p.{page.page_number}" if page.page_number else "document text")
        return ExtractedRuleCandidate(
            sourceDocumentId=request.source_document_id,
            productCode=request.product_code,
            ruleKey=key,
            operator=operator,
            value=value,
            ruleLevel=level,
            ruleNature=nature,
            mandatory=True,
            sourceExcerpt=sentence,
            sourceLocator=locator,
            pageNumber=page.page_number,
            sectionName=page.section_name,
            confidence=confidence,
            reviewStatus="PENDING",
        )

    def _sentences(self, text: str) -> list[str]:
        return [piece.strip() for piece in re.split(r"(?<=[.!?다])\s+|[\r\n]+", text) if piece.strip()]

    def _explicit_visa_condition(self, sentence: str) -> bool:
        return bool(re.search(r"허용|가능|대상|제외|불가|제한|eligible|allowed|except|not eligible", sentence, re.IGNORECASE))

    def _deduplicate(self, candidates: list[ExtractedRuleCandidate]) -> list[ExtractedRuleCandidate]:
        unique = {}
        for candidate in candidates:
            key = (candidate.rule_key, candidate.operator, candidate.value, candidate.page_number)
            unique.setdefault(key, candidate)
        return list(unique.values())
