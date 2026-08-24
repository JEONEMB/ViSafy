import re

from openai import OpenAI

from app.config import Settings
from app.explain.models import ExplanationRequest, ExplanationResponse


SYSTEM_INSTRUCTIONS = """You are ViSafy's explanation layer, not a decision maker.
Use only the supplied eligibility result, structured values, and official excerpts.
Never change the eligibility result. Never promise approval or estimate approval probability.
Do not add a number, amount, period, visa code, channel, document, or condition that is absent.
If evidence is incomplete, say that the bank must confirm it. Return one concise paragraph only.
"""


class OpenAIExplanationEnhancer:
    """Optional explanation enhancer with deterministic fallback and numeric guardrails."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    @property
    def enabled(self) -> bool:
        return (
            self.settings.llm_provider.lower() == "openai"
            and bool(self.settings.openai_api_key or self.settings.llm_api_key)
            and bool(self.settings.openai_model or self.settings.llm_model)
        )

    def enhance(
        self, request: ExplanationRequest, fallback: ExplanationResponse
    ) -> ExplanationResponse:
        if not self.enabled:
            return fallback
        try:
            client = OpenAI(
                api_key=self.settings.openai_api_key or self.settings.llm_api_key,
                timeout=self.settings.llm_timeout_seconds,
                max_retries=0,
            )
            response = client.responses.create(
                model=self.settings.openai_model or self.settings.llm_model,
                instructions=SYSTEM_INSTRUCTIONS,
                input=self._input(request),
                max_output_tokens=250,
            )
            explanation = response.output_text.strip()
            if not explanation or not self._structured_values_preserved(request, explanation):
                return fallback
            return fallback.model_copy(update={"explanation": explanation})
        except Exception:
            return fallback

    def _input(self, request: ExplanationRequest) -> str:
        evidence = [
            {
                "key": detail.key,
                "actualValue": detail.actual_value,
                "expectedValue": detail.expected_value,
                "sourceExcerpt": detail.source_excerpt,
            }
            for detail in request.rule_details
        ]
        return (
            f"language={request.language}\n"
            f"eligibilityStatus={request.eligibility_status}\n"
            f"product={request.institution} {request.product_name}\n"
            f"passedCount={request.passed_count}; failedCount={request.failed_count}\n"
            f"officialRuleDetails={evidence}"
        )

    def _structured_values_preserved(self, request: ExplanationRequest, output: str) -> bool:
        supplied = self._numbers(self._input(request))
        generated = self._numbers(output)
        if not generated.issubset(supplied):
            return False
        supplied_visas = self._visa_codes(self._input(request))
        return self._visa_codes(output).issubset(supplied_visas)

    def _numbers(self, value: str) -> set[str]:
        return {token.replace(",", "") for token in re.findall(r"\d[\d,]*(?:\.\d+)?", value)}

    def _visa_codes(self, value: str) -> set[str]:
        return set(re.findall(r"\b[A-Z]-\d{1,2}\b", value.upper()))
