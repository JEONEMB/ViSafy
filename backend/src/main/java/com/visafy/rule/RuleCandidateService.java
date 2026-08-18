package com.visafy.rule;

import com.visafy.common.domain.ReviewStatus;
import com.visafy.source.SourceDocument;
import com.visafy.source.SourceDocumentService;
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

    public RuleCandidateService(RuleCandidateRepository repository, SourceDocumentService sourceService) {
        this.repository = repository;
        this.sourceService = sourceService;
    }

    @Transactional
    public RuleCandidate create(Long sourceDocumentId, String productCode, String ruleKey, String operator,
                                String ruleValue, RuleLevel ruleLevel, String sourceExcerpt,
                                BigDecimal confidence) {
        SourceDocument source = sourceService.get(sourceDocumentId);
        if (source.getReviewStatus() == ReviewStatus.EXPIRED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expired sources cannot create candidates");
        }
        return repository.save(new RuleCandidate(source, productCode.strip(), ruleKey.strip(), operator.strip(),
                ruleValue.strip(), ruleLevel, sourceExcerpt.strip(), confidence));
    }

    public List<RuleCandidate> findAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public RuleCandidate review(Long id, ReviewAction action, String operator, String ruleValue,
                                String sourceExcerpt) {
        RuleCandidate candidate = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rule candidate not found"));
        SourceDocument source = candidate.getSourceDocument();
        if (source.getValidTo() != null && source.getValidTo().isBefore(LocalDate.now())) {
            candidate.expire();
            return candidate;
        }
        if ((action == ReviewAction.APPROVE || action == ReviewAction.APPROVE_WITH_CHANGES
                || action == ReviewAction.MARK_UNKNOWN) && source.getReviewStatus() != ReviewStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only candidates backed by an APPROVED source can be approved");
        }

        switch (action) {
            case APPROVE -> approveWithConflictCheck(candidate);
            case APPROVE_WITH_CHANGES -> {
                candidate.applyCorrection(operator, ruleValue, sourceExcerpt);
                approveWithConflictCheck(candidate);
            }
            case MARK_UNKNOWN -> candidate.markUnknown();
            case REJECT -> candidate.reject();
        }
        return candidate;
    }

    private void approveWithConflictCheck(RuleCandidate candidate) {
        candidate.approve();
        List<RuleCandidate> approved = repository.findByProductCodeAndRuleKeyAndReviewStatusAndIdNot(
                candidate.getProductCode(), candidate.getRuleKey(), ReviewStatus.APPROVED, candidate.getId());
        boolean conflict = approved.stream().anyMatch(existing ->
                !existing.getRuleValue().equals(candidate.getRuleValue())
                        || !existing.getOperator().equals(candidate.getOperator()));
        if (conflict) {
            candidate.requireReview();
            approved.forEach(RuleCandidate::requireReview);
        }
    }

    public enum ReviewAction {
        APPROVE,
        APPROVE_WITH_CHANGES,
        MARK_UNKNOWN,
        REJECT
    }
}
