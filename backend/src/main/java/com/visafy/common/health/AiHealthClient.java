package com.visafy.common.health;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class AiHealthClient {
    private final RestClient restClient;

    public AiHealthClient(RestClient.Builder builder, @Value("${ai-service.url}") String aiServiceUrl) {
        this.restClient = builder.baseUrl(aiServiceUrl).build();
    }

    public HealthResponse getHealth() {
        try {
            HealthResponse response = restClient.get().uri("/health").retrieve().body(HealthResponse.class);
            return response == null ? HealthResponse.down("AI Service returned an empty response") : response;
        } catch (RestClientException exception) {
            return HealthResponse.down("AI Service is unavailable");
        }
    }
}

