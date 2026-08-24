package com.visafy.assistant;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

@Component
public class AiExplanationClient {
    private static final Logger log = LoggerFactory.getLogger(AiExplanationClient.class);
    private final RestClient restClient;
    private final String internalToken;

    public AiExplanationClient(RestClient.Builder builder, @Value("${ai-service.url}") String aiServiceUrl,
                               @Value("${ai-service.rag-internal-token}") String internalToken) {
        this.restClient = builder.requestFactory(new SimpleClientHttpRequestFactory())
                .baseUrl(aiServiceUrl).build();
        this.internalToken = internalToken;
    }

    public ExplanationResponse explain(ExplanationRequest request) {
        try {
            ExplanationResponse response = restClient.post().uri("/internal/ai/explanation")
                    .header("X-RAG-Internal-Token", internalToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request).retrieve().body(ExplanationResponse.class);
            if (response == null) throw new RestClientException("Empty AI explanation response");
            return response;
        } catch (RestClientResponseException exception) {
            log.warn("AI explanation rejected the request: status={}, body={}",
                    exception.getStatusCode(), exception.getResponseBodyAsString());
            throw unavailable(exception);
        } catch (RestClientException exception) {
            log.warn("AI explanation request failed: {}", exception.getMessage());
            throw unavailable(exception);
        }
    }

    private ResponseStatusException unavailable(Exception cause) {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "AI explanation is unavailable", cause);
    }

    public record ConditionInput(
            String key, String messageCode, String actualValue, String expectedValue,
            String sourceExcerpt, String sourceLocator, String sourceUrl
    ) {}
    public record ExplanationRequest(
            String eligibilityStatus, String language, String productName, String institution,
            String visaType, Long visaRemainingMonths, Long residencyMonths, int passedCount,
            int failedCount, List<ConditionInput> externalConditions,
            List<ConditionInput> unknownConditions, List<ConditionInput> ruleDetails,
            List<String> termKeys
    ) {}
    public record EasyTerm(String key, String koreanTerm, String localizedTerm, String explanation) {}
    public record BankInquiry(String korean, String localized, String language,
                              List<String> confirmationItems) {}
    public record ExplanationResponse(
            String explanation, String disclaimer, List<EasyTerm> easyTerms, BankInquiry inquiry,
            List<String> guardrailsApplied
    ) {}
}
