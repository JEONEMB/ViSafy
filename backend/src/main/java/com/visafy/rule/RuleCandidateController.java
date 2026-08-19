package com.visafy.rule;

import com.visafy.common.domain.ReviewStatus;
import com.visafy.rule.RuleCandidateService.ReviewAction;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/admin")
public class RuleCandidateController {
    private final RuleCandidateService service;

    public RuleCandidateController(RuleCandidateService service) {
        this.service = service;
    }

    @PostMapping("/rule-candidates")
    @ResponseStatus(HttpStatus.CREATED)
    public RuleCandidateResponse create(@Valid @RequestBody CreateRuleCandidateRequest request) {
        return RuleCandidateResponse.from(service.create(request.sourceDocumentId(), request.productCode(),
                request.ruleKey(), request.operator(), request.ruleValue(), request.ruleLevel(),
                request.mandatory(), request.sourceExcerpt(), request.sourceLocator(), request.validFrom(),
                request.validTo(), request.description(), request.confidence()));
    }

    @GetMapping("/rule-candidates")
    public List<RuleCandidateResponse> findAll() {
        return service.findAll().stream().map(RuleCandidateResponse::from).toList();
    }

    @PutMapping("/rules/{id}/review")
    public RuleCandidateResponse review(@PathVariable Long id, @Valid @RequestBody ReviewRuleRequest request) {
        return RuleCandidateResponse.from(service.review(id, request.action(), request.operator(),
                request.ruleValue(), request.sourceExcerpt()));
    }

    @PutMapping("/rules/{id}/approve")
    public RuleCandidateResponse approve(@PathVariable Long id) {
        return RuleCandidateResponse.from(service.review(id, ReviewAction.APPROVE, null, null, null));
    }

    @PutMapping("/rules/{id}/reject")
    public RuleCandidateResponse reject(@PathVariable Long id) {
        return RuleCandidateResponse.from(service.review(id, ReviewAction.REJECT, null, null, null));
    }

    public record CreateRuleCandidateRequest(
            @NotNull Long sourceDocumentId,
            @NotBlank String productCode,
            @NotBlank String ruleKey,
            @NotNull RuleOperator operator,
            @NotBlank String ruleValue,
            @NotNull RuleLevel ruleLevel,
            boolean mandatory,
            @NotBlank String sourceExcerpt,
            @NotBlank String sourceLocator,
            LocalDate validFrom,
            LocalDate validTo,
            @NotBlank String description,
            @NotNull @DecimalMin("0.0") @DecimalMax("1.0") BigDecimal confidence
    ) {
    }

    public record ReviewRuleRequest(
            @NotNull ReviewAction action,
            RuleOperator operator,
            String ruleValue,
            String sourceExcerpt
    ) {
    }

    public record RuleCandidateResponse(
            Long id, Long sourceDocumentId, String sourceTitle, String productCode, String ruleKey,
            RuleOperator operator, String ruleValue, RuleLevel ruleLevel, boolean mandatory,
            String sourceExcerpt, String sourceLocator, LocalDate validFrom, LocalDate validTo,
            String description, BigDecimal confidence, ReviewStatus reviewStatus, Instant lastVerifiedAt
    ) {
        static RuleCandidateResponse from(RuleCandidate candidate) {
            return new RuleCandidateResponse(candidate.getId(), candidate.getSourceDocument().getId(),
                    candidate.getSourceDocument().getTitle(), candidate.getProductCode(), candidate.getRuleKey(),
                    candidate.getOperator(), candidate.getRuleValue(), candidate.getRuleLevel(),
                    candidate.isMandatory(), candidate.getSourceExcerpt(), candidate.getSourceLocator(),
                    candidate.getValidFrom(), candidate.getValidTo(), candidate.getDescription(),
                    candidate.getConfidence(), candidate.getReviewStatus(), candidate.getLastVerifiedAt());
        }
    }
}
