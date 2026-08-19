package com.visafy.rule;

import com.visafy.common.domain.ReviewStatus;
import com.visafy.source.SourceDocument;
import com.visafy.source.SourceDocumentService;
import com.visafy.product.ProductRuleService;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RuleCandidateService {
    private final RuleCandidateRepository repository;
    private final SourceDocumentService sourceService;
    private final ProductRuleService productRuleService;
    private final RuleChangeHistoryRepository historyRepository;

    public RuleCandidateService(RuleCandidateRepository repository, SourceDocumentService sourceService,
                                ProductRuleService productRuleService,
                                RuleChangeHistoryRepository historyRepository) {
        this.repository = repository;
        this.sourceService = sourceService;
        this.productRuleService = productRuleService;
        this.historyRepository = historyRepository;
    }

    @Transactional
    public RuleCandidate create(Long sourceDocumentId, String productCode, String ruleKey, RuleOperator operator,
                                String ruleValue, RuleLevel ruleLevel, boolean mandatory, String sourceExcerpt,
                                String sourceLocator, LocalDate validFrom, LocalDate validTo,
                                String description, BigDecimal confidence) {
        SourceDocument source = sourceService.get(sourceDocumentId);
        if (source.getReviewStatus() == ReviewStatus.EXPIRED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expired sources cannot create candidates");
        }
        if (validFrom != null && validTo != null && validTo.isBefore(validFrom)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "validTo must not be before validFrom");
        }
        return repository.save(new RuleCandidate(source, productCode.strip(), ruleKey.strip().toUpperCase(), operator,
                ruleValue.strip(), ruleLevel, mandatory, sourceExcerpt.strip(), sourceLocator.strip(), validFrom,
                validTo, description.strip(), confidence));
    }

    public List<RuleCandidate> findAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public RuleCandidate review(Long id, ReviewAction action, RuleOperator operator, String ruleValue,
                                String sourceExcerpt) {
        return review(id, action, operator, ruleValue, sourceExcerpt, "system");
    }

    @Transactional
    public RuleCandidate review(Long id, ReviewAction action, RuleOperator operator, String ruleValue,
                                String sourceExcerpt, String reviewer) {
        RuleCandidate candidate = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rule candidate not found"));
        RuleChangeHistory.RuleSnapshot before = RuleChangeHistory.snapshot(candidate);
        SourceDocument source = candidate.getSourceDocument();
        if ((source.getValidTo() != null && source.getValidTo().isBefore(LocalDate.now()))
                || (candidate.getValidTo() != null && candidate.getValidTo().isBefore(LocalDate.now()))) {
            candidate.expire();
            productRuleService.synchronize(candidate);
            saveHistory(candidate, action, reviewer, before);
            return candidate;
        }
        if ((action == ReviewAction.APPROVE || action == ReviewAction.APPROVE_WITH_CHANGES
                || action == ReviewAction.MARK_UNKNOWN) && source.getReviewStatus() != ReviewStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only candidates backed by an APPROVED source can be approved");
        }

        switch (action) {
            case APPROVE -> approveWithConflictCheck(candidate, reviewer);
            case APPROVE_WITH_CHANGES -> {
                candidate.applyCorrection(operator, ruleValue, sourceExcerpt);
                approveWithConflictCheck(candidate, reviewer);
            }
            case MARK_UNKNOWN -> candidate.markUnknown();
            case REJECT -> candidate.reject();
        }
        productRuleService.synchronize(candidate);
        saveHistory(candidate, action, reviewer, before);
        return candidate;
    }

    public List<RuleChangeHistory> history(Long candidateId) {
        if (!repository.existsById(candidateId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Rule candidate not found");
        }
        return historyRepository.findByRuleCandidateIdOrderByReviewedAtDesc(candidateId);
    }

    private void saveHistory(RuleCandidate candidate, ReviewAction action, String reviewer,
                             RuleChangeHistory.RuleSnapshot before) {
        historyRepository.save(new RuleChangeHistory(candidate, action.name(),
                reviewer == null || reviewer.isBlank() ? "system" : reviewer,
                before, RuleChangeHistory.snapshot(candidate)));
    }

    private void approveWithConflictCheck(RuleCandidate candidate, String reviewer) {
        candidate.approve();
        List<RuleCandidate> approved = repository.findByProductCodeAndRuleKeyAndReviewStatusAndIdNot(
                candidate.getProductCode(), candidate.getRuleKey(), ReviewStatus.APPROVED, candidate.getId());
        boolean conflict = approved.stream().anyMatch(existing ->
                !existing.getRuleValue().equals(candidate.getRuleValue())
                        || !existing.getOperator().equals(candidate.getOperator()));
        if (conflict) {
            candidate.requireReview();
            approved.forEach(existing -> {
                RuleChangeHistory.RuleSnapshot existingBefore = RuleChangeHistory.snapshot(existing);
                existing.requireReview();
                productRuleService.synchronize(existing);
                historyRepository.save(new RuleChangeHistory(existing, "SOURCE_CONFLICT",
                        reviewer == null || reviewer.isBlank() ? "system" : reviewer,
                        existingBefore, RuleChangeHistory.snapshot(existing)));
            });
        }
    }

    public enum ReviewAction {
        APPROVE,
        APPROVE_WITH_CHANGES,
        MARK_UNKNOWN,
        REJECT
    }
}
