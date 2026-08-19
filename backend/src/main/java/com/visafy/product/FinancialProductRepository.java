package com.visafy.product;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FinancialProductRepository extends JpaRepository<FinancialProduct, Long> {
    boolean existsByProductCode(String productCode);
    Optional<FinancialProduct> findByProductCode(String productCode);

    @EntityGraph(attributePaths = "sourceDocument")
    List<FinancialProduct> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = "sourceDocument")
    List<FinancialProduct> findByActiveTrueOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = "sourceDocument")
    Optional<FinancialProduct> findOneById(Long id);
}
