package com.visafy.eligibility;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "precheck_result")
public class PrecheckResultEntity {
    @Id @Column(length = 36)
    private String id;
    @Column(nullable = false, length = 64)
    private String profileSessionHash;
    @Column(nullable = false)
    private Long profileId;
    @Column(nullable = false)
    private Long productId;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 40)
    private EligibilityStatus status;
    @Column(nullable = false)
    private LocalDate informationBaseDate;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String disclaimer;
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
    @Column(nullable = false)
    private Instant expiresAt;
    @OneToMany(mappedBy = "precheckResult", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PrecheckRuleResultEntity> ruleResults = new ArrayList<>();

    protected PrecheckResultEntity() {}

    PrecheckResultEntity(String id, String profileSessionHash, Long profileId, Long productId,
                         EligibilityStatus status, LocalDate informationBaseDate, String disclaimer,
                         Instant createdAt, Instant expiresAt) {
        this.id = id; this.profileSessionHash = profileSessionHash; this.profileId = profileId;
        this.productId = productId; this.status = status; this.informationBaseDate = informationBaseDate;
        this.disclaimer = disclaimer; this.createdAt = createdAt; this.expiresAt = expiresAt;
    }

    void add(PrecheckRuleResultEntity result) { ruleResults.add(result); }
    public String getId() { return id; }
    public String getProfileSessionHash() { return profileSessionHash; }
    public Long getProductId() { return productId; }
    public EligibilityStatus getStatus() { return status; }
    public LocalDate getInformationBaseDate() { return informationBaseDate; }
    public String getDisclaimer() { return disclaimer; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getExpiresAt() { return expiresAt; }
    public List<PrecheckRuleResultEntity> getRuleResults() { return List.copyOf(ruleResults); }
}
