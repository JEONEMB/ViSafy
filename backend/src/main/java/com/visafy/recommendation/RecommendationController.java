package com.visafy.recommendation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {
    private final RecommendationService service;

    public RecommendationController(RecommendationService service) {
        this.service = service;
    }

    @PostMapping
    public RecommendationResult recommend(@Valid @RequestBody RecommendationRequest request) {
        return service.recommend(request.profileSessionId());
    }

    public record RecommendationRequest(@NotBlank String profileSessionId) {
    }
}
