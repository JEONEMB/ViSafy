package com.visafy.product;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

public interface ProductRuleRepository extends JpaRepository<ProductRule, Long> {
    Optional<ProductRule> findByRuleCandidateId(Long ruleCandidateId);
    @EntityGraph(attributePaths = {"product", "sourceDocument"})
    List<ProductRule> findByProductIdAndActiveTrueOrderByRuleKeyAsc(Long productId);
}
