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
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.server.ResponseStatusException;
import com.visafy.rag.RagIndexRefreshRequested;

@Service
public class RuleCandidateService {
    private final RuleCandidateRepository repository;
    private final SourceDocumentService sourceService;
    private final ProductRuleService productRuleService;
    private final RuleChangeHistoryRepository historyRepository;
    private final ApplicationEventPublisher eventPublisher;

    public RuleCandidateService(RuleCandidateRepository repository, SourceDocumentService sourceService,
                                ProductRuleService productRuleService,
                                RuleChangeHistoryRepository historyRepository,
                                ApplicationEventPublisher eventPublisher) {
        this.repository = repository;
        this.sourceService = sourceService;
        this.productRuleService = productRuleService;
        this.historyRepository = historyRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public RuleCandidate create(Long sourceDocumentId, String productCode, String ruleKey, RuleOperator operator,
                                String ruleValue, RuleLevel ruleLevel, boolean mandatory, String sourceExcerpt,
                                String sourceLocator, LocalDate validFrom, LocalDate validTo,
                                String description, BigDecimal confidence) {
        return create(sourceDocumentId, productCode, ruleKey, operator, ruleValue, ruleLevel,
                RuleNature.defaultFor(ruleLevel), mandatory, sourceExcerpt, sourceLocator, null, null,
                validFrom, validTo, description, confidence);
    }

    @Transactional
    public RuleCandidate create(Long sourceDocumentId, String productCode, String ruleKey, RuleOperator operator,
                                String ruleValue, RuleLevel ruleLevel, RuleNature ruleNature, boolean mandatory,
                                String sourceExcerpt, String sourceLocator, Integer pageNumber, String sectionName,
                                LocalDate validFrom, LocalDate validTo, String description, BigDecimal confidence) {
        SourceDocument source = sourceService.get(sourceDocumentId);
        if (source.getReviewStatus() == ReviewStatus.EXPIRED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expired sources cannot create candidates");
        }
        if (validFrom != null && validTo != null && validTo.isBefore(validFrom)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "validTo must not be before validFrom");
        }
        validateNature(ruleLevel, ruleNature);
        return repository.save(new RuleCandidate(source, productCode.strip(), ruleKey.strip().toUpperCase(), operator,
                ruleValue.strip(), ruleLevel, ruleNature, mandatory, sourceExcerpt.strip(), sourceLocator.strip(),
                pageNumber, sectionName == null || sectionName.isBlank() ? null : sectionName.strip(), validFrom,
                validTo, description.strip(), confidence));
    }

    private void validateNature(RuleLevel level, RuleNature nature) {
        RuleNature normalized = nature == null ? RuleNature.defaultFor(level) : nature;
        if (normalized == RuleNature.HARD_ELIGIBILITY && level != RuleLevel.HARD) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "HARD_ELIGIBILITY must use HARD ruleLevel");
        }
        if (normalized == RuleNature.EXTERNAL_CHECK && level != RuleLevel.EXTERNAL_CHECK) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "EXTERNAL_CHECK nature must use EXTERNAL_CHECK ruleLevel");
        }
        if (normalized == RuleNature.UNKNOWN_ELIGIBILITY && level != RuleLevel.UNKNOWN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "UNKNOWN_ELIGIBILITY must use UNKNOWN ruleLevel");
        }
        if (level == RuleLevel.HARD && normalized != RuleNature.HARD_ELIGIBILITY) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Documents, identification, channels, benefits, and information cannot be HARD eligibility rules");
        }
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
            eventPublisher.publishEvent(new RagIndexRefreshRequested("rule-review-" + id));
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
            case MARK_UNKNOWN -> candidate.markUnknown(reviewer);
            case REJECT -> candidate.reject(reviewer);
        }
        productRuleService.synchronize(candidate);
        saveHistory(candidate, action, reviewer, before);
        eventPublisher.publishEvent(new RagIndexRefreshRequested("rule-review-" + id));
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
        if (violatesRealNameForeignerGuardrail(candidate)) {
            candidate.requireReview(reviewer);
            return;
        }
        candidate.approve(reviewer);
        List<RuleCandidate> approved = repository.findByProductCodeAndRuleKeyAndReviewStatusAndIdNot(
                candidate.getProductCode(), candidate.getRuleKey(), ReviewStatus.APPROVED, candidate.getId());
        boolean conflict = approved.stream().anyMatch(existing ->
                isCurrentlyEffective(existing)
                        && existing.getOperator().equals(candidate.getOperator())
                        && !existing.getRuleValue().equals(candidate.getRuleValue()));
        if (conflict) {
            candidate.requireReview(reviewer);
            approved.stream().filter(this::isCurrentlyEffective).forEach(existing -> {
                RuleChangeHistory.RuleSnapshot existingBefore = RuleChangeHistory.snapshot(existing);
                existing.requireReview(reviewer);
                productRuleService.synchronize(existing);
                historyRepository.save(new RuleChangeHistory(existing, "SOURCE_CONFLICT",
                        reviewer == null || reviewer.isBlank() ? "system" : reviewer,
                        existingBefore, RuleChangeHistory.snapshot(existing)));
            });
        }
    }

    private boolean violatesRealNameForeignerGuardrail(RuleCandidate candidate) {
        String key = candidate.getRuleKey().toUpperCase(java.util.Locale.ROOT);
        if (!key.equals("FOREIGNER_ALLOWED") && !key.equals("IS_FOREIGNER")) return false;
        String evidence = candidate.getSourceExcerpt().toUpperCase(java.util.Locale.ROOT);
        boolean assertsAllowed = candidate.getRuleValue().equalsIgnoreCase("true")
                || candidate.getRuleValue().equalsIgnoreCase("\"true\"");
        return assertsAllowed && (evidence.contains("실명의 개인") || evidence.contains("REAL-NAME INDIVIDUAL"))
                && !evidence.contains("외국인") && !evidence.contains("FOREIGNER");
    }

    private boolean isCurrentlyEffective(RuleCandidate candidate) {
        LocalDate today = LocalDate.now();
        return candidate.getSourceDocument().isEffective(today)
                && (candidate.getValidFrom() == null || !candidate.getValidFrom().isAfter(today))
                && (candidate.getValidTo() == null || !candidate.getValidTo().isBefore(today));
    }

    public enum ReviewAction {
        APPROVE,
        APPROVE_WITH_CHANGES,
        MARK_UNKNOWN,
        REJECT
    }
}
