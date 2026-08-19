package com.visafy.product;

import com.visafy.common.domain.ReviewStatus;
import com.visafy.rule.RuleCandidate;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class ProductRuleService {
    private final ProductRuleRepository repository;

    public ProductRuleService(ProductRuleRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void synchronize(RuleCandidate candidate) {
        boolean approved = candidate.getReviewStatus() == ReviewStatus.APPROVED;
        repository.findByRuleCandidateId(candidate.getId()).ifPresentOrElse(
                rule -> rule.synchronize(candidate, approved),
                () -> {
                    if (approved) repository.save(new ProductRule(candidate));
                });
    }
}
