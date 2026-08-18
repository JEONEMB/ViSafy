package com.visafy.profile;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TempProfileRepository extends JpaRepository<TempProfile, Long> {
    Optional<TempProfile> findBySessionId(String sessionId);
}
