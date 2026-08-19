package com.visafy.guidance;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductDocumentRequirementRepository extends JpaRepository<ProductDocumentRequirement, Long> {
    @EntityGraph(attributePaths = {"sourceDocument"})
    List<ProductDocumentRequirement> findByProductIdAndActiveTrueOrderByIdAsc(Long productId);
}
