package com.visafy.execution;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ApiExecutionHistoryService {
    public static final String PRECHECK = "PRECHECK";
    public static final String RECOMMENDATION = "RECOMMENDATION";

    private final ApiExecutionHistoryRepository repository;
    private final ObjectMapper objectMapper;

    public ApiExecutionHistoryService(ApiExecutionHistoryRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public StoredExecution save(String type, String profileSessionId, Object result, Instant expiresAt) {
        Instant now = Instant.now();
        Instant boundedExpiry = expiresAt.isBefore(now.plusSeconds(86400)) ? expiresAt : now.plusSeconds(86400);
        String id = UUID.randomUUID().toString();
        try {
            ApiExecutionHistory saved = repository.save(new ApiExecutionHistory(id, type,
                    hashSessionId(profileSessionId), objectMapper.writeValueAsString(result), now, boundedExpiry));
            return new StoredExecution(saved.getId(), saved.getCreatedAt(), saved.getExpiresAt());
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not serialize execution result", exception);
        }
    }

    public <T> RetrievedExecution<T> get(String id, String type, String profileSessionId, Class<T> resultType) {
        ApiExecutionHistory history = repository.findById(id)
                .filter(value -> value.getExecutionType().equals(type))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Execution result not found"));
        if (history.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.GONE, "Execution result has expired");
        }
        if (!MessageDigest.isEqual(history.getProfileSessionHash().getBytes(StandardCharsets.UTF_8),
                hashSessionId(profileSessionId).getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Execution result not found");
        }
        try {
            return new RetrievedExecution<>(history.getId(), objectMapper.readValue(history.getResultJson(), resultType),
                    history.getCreatedAt(), history.getExpiresAt());
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not deserialize execution result", exception);
        }
    }

    public static String hashSessionId(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.strip().getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    public record StoredExecution(String id, Instant createdAt, Instant expiresAt) {}
    public record RetrievedExecution<T>(String id, T result, Instant createdAt, Instant expiresAt) {}
}
