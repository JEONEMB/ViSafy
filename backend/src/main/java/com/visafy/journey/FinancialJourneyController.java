package com.visafy.journey;

import jakarta.validation.constraints.NotBlank;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Validated
@RestController
@RequestMapping("/api/financial-journey")
public class FinancialJourneyController {
    private final FinancialJourneyService service;

    public FinancialJourneyController(FinancialJourneyService service) {
        this.service = service;
    }

    @GetMapping
    public FinancialJourneyResult get(@RequestParam @NotBlank String profileSessionId) {
        return service.get(profileSessionId);
    }

    @PutMapping("/progress/{stepCode}")
    public FinancialJourneyResult progress(@PathVariable String stepCode, @RequestBody ProgressRequest request) {
        service.updateProgress(request.profileSessionId(), stepCode, request.completed());
        return service.get(request.profileSessionId());
    }

    public record ProgressRequest(@NotBlank String profileSessionId, boolean completed) {}
}
