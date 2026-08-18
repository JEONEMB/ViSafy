package com.visafy.source;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SourceDocumentRepository extends JpaRepository<SourceDocument, Long> {
    boolean existsByContentHash(String contentHash);
    List<SourceDocument> findAllByOrderByCreatedAtDesc();
}
