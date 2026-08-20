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
import java.security.Principal;

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
                request.ruleNature(), request.mandatory(), request.sourceExcerpt(), request.sourceLocator(),
                request.pageNumber(), request.sectionName(), request.validFrom(),
                request.validTo(), request.description(), request.confidence()));
    }

    @GetMapping("/rule-candidates")
    public List<RuleCandidateResponse> findAll() {
        return service.findAll().stream().map(RuleCandidateResponse::from).toList();
    }

    @PutMapping("/rules/{id}/review")
    public RuleCandidateResponse review(@PathVariable Long id, @Valid @RequestBody ReviewRuleRequest request,
                                        Principal principal) {
        return RuleCandidateResponse.from(service.review(id, request.action(), request.operator(),
                request.ruleValue(), request.sourceExcerpt(), reviewer(principal)));
    }

    @PutMapping("/rules/{id}/approve")
    public RuleCandidateResponse approve(@PathVariable Long id, Principal principal) {
        return RuleCandidateResponse.from(service.review(id, ReviewAction.APPROVE, null, null, null,
                reviewer(principal)));
    }

    @PutMapping("/rules/{id}/reject")
    public RuleCandidateResponse reject(@PathVariable Long id, Principal principal) {
        return RuleCandidateResponse.from(service.review(id, ReviewAction.REJECT, null, null, null,
                reviewer(principal)));
    }

    @GetMapping("/rules/{id}/history")
    public List<RuleHistoryResponse> history(@PathVariable Long id) {
        return service.history(id).stream().map(RuleHistoryResponse::from).toList();
    }

    private String reviewer(Principal principal) { return principal == null ? "system" : principal.getName(); }

    public record CreateRuleCandidateRequest(
            @NotNull Long sourceDocumentId,
            @NotBlank String productCode,
            @NotBlank String ruleKey,
            @NotNull RuleOperator operator,
            @NotBlank String ruleValue,
            @NotNull RuleLevel ruleLevel,
            RuleNature ruleNature,
            boolean mandatory,
            @NotBlank String sourceExcerpt,
            @NotBlank String sourceLocator,
            @jakarta.validation.constraints.Min(1) Integer pageNumber,
            String sectionName,
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
            RuleNature ruleNature, String sourceExcerpt, String sourceLocator, Integer pageNumber,
            String sectionName, LocalDate validFrom, LocalDate validTo,
            String description, BigDecimal confidence, ReviewStatus reviewStatus, Instant lastVerifiedAt
    ) {
        static RuleCandidateResponse from(RuleCandidate candidate) {
            return new RuleCandidateResponse(candidate.getId(), candidate.getSourceDocument().getId(),
                    candidate.getSourceDocument().getTitle(), candidate.getProductCode(), candidate.getRuleKey(),
                    candidate.getOperator(), candidate.getRuleValue(), candidate.getRuleLevel(),
                    candidate.isMandatory(), candidate.getRuleNature(), candidate.getSourceExcerpt(),
                    candidate.getSourceLocator(), candidate.getPageNumber(), candidate.getSectionName(),
                    candidate.getValidFrom(), candidate.getValidTo(), candidate.getDescription(),
                    candidate.getConfidence(), candidate.getReviewStatus(), candidate.getLastVerifiedAt());
        }
    }

    public record RuleHistoryResponse(
            Long id, Long ruleCandidateId, String action, String reviewer,
            String beforeOperator, String beforeValue, String beforeLevel, String beforeStatus,
            String afterOperator, String afterValue, String afterLevel, String afterStatus, Instant reviewedAt
    ) {
        static RuleHistoryResponse from(RuleChangeHistory history) {
            return new RuleHistoryResponse(history.getId(), history.getRuleCandidate().getId(),
                    history.getAction(), history.getReviewer(), history.getBeforeOperator(), history.getBeforeValue(),
                    history.getBeforeLevel(), history.getBeforeStatus(), history.getAfterOperator(),
                    history.getAfterValue(), history.getAfterLevel(), history.getAfterStatus(), history.getReviewedAt());
        }
    }
}
