package com.visafy.journey;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.time.Instant;
import java.util.UUID;

@Entity
public class FinancialJourneyProgress {
    @Id @Column(length = 36)
    private String id;
    @Column(nullable = false, length = 64)
    private String profileSessionHash;
    @Column(nullable = false, length = 60)
    private String stepCode;
    @Column(nullable = false)
    private boolean completed;
    @Column(nullable = false)
    private Instant updatedAt;
    @Column(nullable = false)
    private Instant expiresAt;

    protected FinancialJourneyProgress() {}
    public FinancialJourneyProgress(String profileSessionHash, String stepCode, boolean completed, Instant expiresAt) {
        this.id = UUID.randomUUID().toString(); this.profileSessionHash = profileSessionHash;
        this.stepCode = stepCode; this.completed = completed; this.updatedAt = Instant.now(); this.expiresAt = expiresAt;
    }
    public void update(boolean value, Instant expiry) { completed = value; expiresAt = expiry; updatedAt = Instant.now(); }
    public String getStepCode() { return stepCode; }
    public boolean isCompleted() { return completed; }
}
