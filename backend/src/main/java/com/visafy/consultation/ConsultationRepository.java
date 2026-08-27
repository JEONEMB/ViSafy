package com.visafy.consultation;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConsultationRepository extends JpaRepository<Consultation, String> {
    List<Consultation> findTop10ByProfileSessionHashAndProductIdOrderByCreatedAtDesc(String profileSessionHash, Long productId);
}
