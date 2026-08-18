package com.visafy.common.health;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {
    private final AiHealthClient aiHealthClient;

    public HealthController(AiHealthClient aiHealthClient) {
        this.aiHealthClient = aiHealthClient;
    }

    @GetMapping
    public HealthResponse health() {
        return HealthResponse.up();
    }

    @GetMapping("/ai")
    public HealthResponse aiHealth() {
        return aiHealthClient.getHealth();
    }
}

