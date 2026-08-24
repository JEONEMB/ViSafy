package com.visafy.source;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SourceDocumentRepository extends JpaRepository<SourceDocument, Long> {
    boolean existsByContentHash(String contentHash);
    Optional<SourceDocument> findFirstBySourceUrlOrderByRetrievedAtDesc(String sourceUrl);
    List<SourceDocument> findAllByOrderByCreatedAtDesc();
}
