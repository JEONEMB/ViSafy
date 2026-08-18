package com.visafy.common.health;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record HealthResponse(String status, String message) {
    public static HealthResponse up() {
        return new HealthResponse("UP", null);
    }

    public static HealthResponse down(String message) {
        return new HealthResponse("DOWN", message);
    }
}

