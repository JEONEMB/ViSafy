package com.visafy.eligibility;

import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PrecheckResultRepository extends JpaRepository<PrecheckResultEntity, String> {
    @EntityGraph(attributePaths = "ruleResults")
    Optional<PrecheckResultEntity> findOneById(String id);
}
