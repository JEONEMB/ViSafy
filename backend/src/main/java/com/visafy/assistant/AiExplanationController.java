package com.visafy.assistant;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiExplanationController {
    private final AiExplanationService service;

    public AiExplanationController(AiExplanationService service) {
        this.service = service;
    }

    @PostMapping("/explanation")
    public AiExplanationService.ExplanationResult explain(@Valid @RequestBody ExplanationRequest request) {
        return service.explain(request.profileSessionId(), request.productId());
    }

    public record ExplanationRequest(@NotBlank String profileSessionId, @NotNull Long productId) {}
}
