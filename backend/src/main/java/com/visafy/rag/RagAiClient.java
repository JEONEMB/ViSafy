package com.visafy.rag;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.server.ResponseStatusException;

@Component
public class RagAiClient {
    private static final Logger log = LoggerFactory.getLogger(RagAiClient.class);
    private final RestClient restClient;
    private final String internalToken;

    public RagAiClient(RestClient.Builder builder, @Value("${ai-service.url}") String aiServiceUrl,
                       @Value("${ai-service.rag-internal-token}") String internalToken) {
        // Uvicorn serves HTTP/1.1. Use the simple request factory so the JDK client does not
        // attempt an h2c upgrade that can make the request body appear empty to the AI service.
        this.restClient = builder.requestFactory(new SimpleClientHttpRequestFactory())
                .baseUrl(aiServiceUrl).build();
        this.internalToken = internalToken;
    }

    public SyncResponse sync(List<IndexDocument> documents) {
        try {
            SyncResponse response = restClient.post().uri("/internal/rag/documents/sync")
                    .header("X-RAG-Internal-Token", internalToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new SyncRequest(documents)).retrieve().body(SyncResponse.class);
            if (response == null) throw new RestClientException("Empty AI response");
            return response;
        } catch (RestClientResponseException exception) {
            log.warn("AI document indexing rejected the request: status={}, body={}",
                    exception.getStatusCode(), exception.getResponseBodyAsString());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "AI document indexing is unavailable", exception);
        } catch (RestClientException exception) {
            log.warn("AI document indexing request failed: {}", exception.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "AI document indexing is unavailable", exception);
        }
    }

    public RagAnswerResponse answer(RagAnswerRequest request) {
        try {
            RagAnswerResponse response = restClient.post().uri("/internal/rag/answer")
                    .header("X-RAG-Internal-Token", internalToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request).retrieve().body(RagAnswerResponse.class);
            if (response == null) throw new RestClientException("Empty AI response");
            return response;
        } catch (RestClientResponseException exception) {
            log.warn("AI grounded answer rejected the request: status={}, body={}",
                    exception.getStatusCode(), exception.getResponseBodyAsString());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "AI grounded answer is unavailable", exception);
        } catch (RestClientException exception) {
            log.warn("AI grounded answer request failed: {}", exception.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "AI grounded answer is unavailable", exception);
        }
    }

    public record SyncRequest(List<IndexDocument> documents) {}
    public record SyncResponse(int indexedDocuments, int indexedChunks) {}
    public record IndexDocument(
            Long documentId, String institution, String documentName, String sourceType, String sourceUrl,
            Instant retrievedAt, LocalDate validFrom, LocalDate validTo, Long productId, String language,
            String reviewStatus, String contentHash, String content, List<String> ruleKeys
    ) {}
    public record RagAnswerRequest(
            Long productId, String ruleKey, String query, int topK, String eligibilityStatus,
            String ruleResult, String language
    ) {}
    public record RetrievedDocument(
            Long documentId, String title, String content, String sourceUrl, Instant retrievedAt, double score,
            String institution, String sourceType, LocalDate validFrom, LocalDate validTo, Long productId,
            String language
    ) {}
    public record RagAnswerResponse(
            String answer, String eligibilityStatus, String ruleResult, List<RetrievedDocument> documents,
            List<String> guardrailsApplied
    ) {}
}
