package com.visafy.rule;

import com.visafy.common.domain.ReviewStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

public interface RuleCandidateRepository extends JpaRepository<RuleCandidate, Long> {
    @EntityGraph(attributePaths = "sourceDocument")
    List<RuleCandidate> findAllByOrderByCreatedAtDesc();
    List<RuleCandidate> findByProductCodeAndRuleKeyAndReviewStatusAndIdNot(
            String productCode, String ruleKey, ReviewStatus reviewStatus, Long id);
    @EntityGraph(attributePaths = "sourceDocument")
    List<RuleCandidate> findByProductCodeOrderByCreatedAtDesc(String productCode);
}
