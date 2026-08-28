"""Combines the deterministic extractor with the LLM proposer.

The rule-based extractor always runs and its results are always kept, so extraction stays
useful with no API key and during a provider outage. The LLM only adds conditions that the
verifier could trace back to the official document verbatim.
"""

from app.extraction.llm_rule_extractor import LlmRuleCandidateProposer
from app.extraction.models import (
    ExtractedRuleCandidate,
    RuleCandidateExtractionRequest,
    RuleCandidateExtractionResponse,
)
from app.extraction.rule_candidate_extractor import ConservativeRuleCandidateExtractor

BASE_WARNINGS = [
    "Candidates are PENDING and must be reviewed by an administrator.",
    "The phrase '실명의 개인' alone never creates a FOREIGNER_ALLOWED rule.",
]


class CompositeRuleCandidateExtractor:
    def __init__(self, proposer: LlmRuleCandidateProposer) -> None:
        self.rule_based = ConservativeRuleCandidateExtractor()
        self.proposer = proposer

    def extract(
        self, request: RuleCandidateExtractionRequest
    ) -> RuleCandidateExtractionResponse:
        base = self.rule_based.extract(request)
        candidates = list(base.candidates)
        warnings = list(BASE_WARNINGS)

        attempted = self.proposer.enabled
        proposed: list[ExtractedRuleCandidate] = []
        rejected = 0
        if attempted:
            proposed, rejected = self.proposer.propose(request)

        seen = {self._fingerprint(candidate) for candidate in candidates}
        added = 0
        for candidate in proposed:
            fingerprint = self._fingerprint(candidate)
            if fingerprint in seen:
                continue
            seen.add(fingerprint)
            candidates.append(candidate)
            added += 1

        if attempted:
            warnings.append(
                "AI proposals are accepted only when the quoted sentence exists verbatim in the "
                "stored official snapshot."
            )
        else:
            warnings.append(
                "AI proposal is disabled, so only rule-based candidates were extracted."
            )

        return RuleCandidateExtractionResponse(
            candidates=candidates,
            warnings=warnings,
            llmAttempted=attempted,
            llmProposed=added,
            llmRejected=rejected,
        )

    def _fingerprint(self, candidate: ExtractedRuleCandidate) -> tuple[str, str, str, int | None]:
        return (candidate.rule_key, candidate.operator, candidate.value, candidate.page_number)
