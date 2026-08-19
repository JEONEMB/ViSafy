package com.visafy.product;

import com.visafy.common.domain.ReviewStatus;
import com.visafy.rule.RuleCandidate;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProductRuleService {
    private final ProductRuleRepository repository;
    private final FinancialProductRepository productRepository;

    public ProductRuleService(ProductRuleRepository repository, FinancialProductRepository productRepository) {
        this.repository = repository;
        this.productRepository = productRepository;
    }

    @Transactional
    public void synchronize(RuleCandidate candidate) {
        boolean approved = candidate.getReviewStatus() == ReviewStatus.APPROVED;
        var existing = repository.findByRuleCandidateId(candidate.getId());
        if (!approved) {
            existing.ifPresent(rule -> rule.synchronize(rule.getProduct(), candidate, false));
            return;
        }
        FinancialProduct product = productRepository.findByProductCode(candidate.getProductCode())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "A registered product is required before approving its rule"));
        existing.ifPresentOrElse(
                rule -> rule.synchronize(product, candidate, true),
                () -> repository.save(new ProductRule(product, candidate)));
    }
}
