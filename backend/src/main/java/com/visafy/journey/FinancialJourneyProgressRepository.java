package com.visafy.journey;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FinancialJourneyProgressRepository extends JpaRepository<FinancialJourneyProgress, String> {
    List<FinancialJourneyProgress> findByProfileSessionHashAndCompletedTrue(String profileSessionHash);
    Optional<FinancialJourneyProgress> findByProfileSessionHashAndStepCode(String profileSessionHash, String stepCode);
}
