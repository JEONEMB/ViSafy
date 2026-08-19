package com.visafy.product;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRuleRepository extends JpaRepository<ProductRule, Long> {
    Optional<ProductRule> findByRuleCandidateId(Long ruleCandidateId);
    List<ProductRule> findByProductCodeAndActiveTrueOrderByRuleKeyAsc(String productCode);
}
