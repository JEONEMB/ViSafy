package com.visafy.rule;

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
public class RuleExtractionAiClient {
    private static final Logger log = LoggerFactory.getLogger(RuleExtractionAiClient.class);
    private final RestClient restClient;
    private final String internalToken;

    public RuleExtractionAiClient(RestClient.Builder builder, @Value("${ai-service.url}") String aiServiceUrl,
                                  @Value("${ai-service.rag-internal-token}") String internalToken) {
        // Uvicorn serves HTTP/1.1, so keep the simple request factory used by the other AI clients.
        this.restClient = builder.requestFactory(new SimpleClientHttpRequestFactory())
                .baseUrl(aiServiceUrl).build();
        this.internalToken = internalToken;
    }

    public ExtractionResponse extract(ExtractionRequest request) {
        try {
            ExtractionResponse response = restClient.post().uri("/internal/extraction/rule-candidates")
                    .header("X-RAG-Internal-Token", internalToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request).retrieve().body(ExtractionResponse.class);
            if (response == null) throw new RestClientException("Empty AI response");
            return response;
        } catch (RestClientResponseException exception) {
            log.warn("AI rule extraction rejected the request: status={}, body={}",
                    exception.getStatusCode(), exception.getResponseBodyAsString());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "AI rule extraction is unavailable", exception);
        } catch (RestClientException exception) {
            log.warn("AI rule extraction request failed: {}", exception.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "AI rule extraction is unavailable", exception);
        }
    }

    public record ExtractionRequest(String productCode, Long sourceDocumentId, List<Page> pages) {}

    public record Page(Integer pageNumber, String sectionName, String text) {}

    public record ExtractedCandidate(
            Long sourceDocumentId, String productCode, String ruleKey, String operator, String value,
            String ruleLevel, String ruleNature, boolean mandatory, String sourceExcerpt, String sourceLocator,
            Integer pageNumber, String sectionName, double confidence, String reviewStatus, String extractor
    ) {}

    public record ExtractionResponse(
            List<ExtractedCandidate> candidates, List<String> warnings,
            boolean llmAttempted, int llmProposed, int llmRejected
    ) {}
}
