package com.visafy.guidance;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductApplicationStepRepository extends JpaRepository<ProductApplicationStep, Long> {
    boolean existsByProductIdAndStepOrder(Long productId, int stepOrder);

    @EntityGraph(attributePaths = {"sourceDocument"})
    List<ProductApplicationStep> findByProductIdAndActiveTrueOrderByStepOrderAsc(Long productId);
}
