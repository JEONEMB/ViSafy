from fastapi import APIRouter, Depends

from app.api.rag import require_internal_token
from app.config import settings
from app.extraction.composite_extractor import CompositeRuleCandidateExtractor
from app.extraction.llm_rule_extractor import LlmRuleCandidateProposer
from app.extraction.models import RuleCandidateExtractionRequest, RuleCandidateExtractionResponse

router = APIRouter(prefix="/internal/extraction", tags=["extraction"], dependencies=[Depends(require_internal_token)])
extractor = CompositeRuleCandidateExtractor(LlmRuleCandidateProposer(settings))


@router.post("/rule-candidates", response_model=RuleCandidateExtractionResponse)
def extract_rule_candidates(request: RuleCandidateExtractionRequest) -> RuleCandidateExtractionResponse:
    return extractor.extract(request)
