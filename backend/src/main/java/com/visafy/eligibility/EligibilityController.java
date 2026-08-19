package com.visafy.eligibility;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/eligibility")
public class EligibilityController {
    private final EligibilityService service;

    public EligibilityController(EligibilityService service) {
        this.service = service;
    }

    @PostMapping("/pre-check")
    public EligibilityResult precheck(@Valid @RequestBody PrecheckRequest request) {
        return service.precheck(request.profileSessionId(), request.productId());
    }

    public record PrecheckRequest(@NotBlank String profileSessionId, @NotNull Long productId) {
    }
}
