from fastapi import APIRouter, Depends

from app.api.rag import require_internal_token
from app.extraction.models import RuleCandidateExtractionRequest, RuleCandidateExtractionResponse
from app.extraction.rule_candidate_extractor import ConservativeRuleCandidateExtractor

router = APIRouter(prefix="/internal/extraction", tags=["extraction"], dependencies=[Depends(require_internal_token)])
extractor = ConservativeRuleCandidateExtractor()


@router.post("/rule-candidates", response_model=RuleCandidateExtractionResponse)
def extract_rule_candidates(request: RuleCandidateExtractionRequest) -> RuleCandidateExtractionResponse:
    return extractor.extract(request)
