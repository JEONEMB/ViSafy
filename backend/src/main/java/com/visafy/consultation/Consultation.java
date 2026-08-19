package com.visafy.consultation;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import java.time.Instant;

@Entity
public class Consultation {
    @Id @Column(length = 36)
    private String id;
    @Column(nullable = false, length = 64)
    private String profileSessionHash;
    @Column(nullable = false)
    private Long productId;
    @Column(nullable = false, length = 120)
    private String ruleKey;
    @Lob @Column(nullable = false, columnDefinition = "TEXT")
    private String question;
    @Lob @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String answer;
    @Column(nullable = false, length = 10)
    private String language;
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
    @Column(nullable = false)
    private Instant expiresAt;

    protected Consultation() {}
    public Consultation(String id, String profileSessionHash, Long productId, String ruleKey,
                        String question, String answer, String language, Instant createdAt, Instant expiresAt) {
        this.id = id; this.profileSessionHash = profileSessionHash; this.productId = productId;
        this.ruleKey = ruleKey; this.question = question; this.answer = answer; this.language = language;
        this.createdAt = createdAt; this.expiresAt = expiresAt;
    }
    public String getId() { return id; }
    public Instant getCreatedAt() { return createdAt; }
}
