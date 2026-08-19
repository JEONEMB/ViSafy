package com.visafy.rule;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RuleChangeHistoryRepository extends JpaRepository<RuleChangeHistory, Long> {
    @EntityGraph(attributePaths = "ruleCandidate")
    List<RuleChangeHistory> findByRuleCandidateIdOrderByReviewedAtDesc(Long ruleCandidateId);
}
