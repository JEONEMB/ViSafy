package com.visafy.common.health;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Mirrors the AI Service health payload so that the provider fields survive the proxy hop.
 * Backend-only checks leave them null and serialise as {@code {"status":"UP"}}.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record HealthResponse(
        String status,
        String message,
        String embeddingProvider,
        String embeddingModel,
        String llmProvider,
        Boolean llmConfigured) {

    public static HealthResponse up() {
        return new HealthResponse("UP", null, null, null, null, null);
    }

    public static HealthResponse down(String message) {
        return new HealthResponse("DOWN", message, null, null, null, null);
    }
}
