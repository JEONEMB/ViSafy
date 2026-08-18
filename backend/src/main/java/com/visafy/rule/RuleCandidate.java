package com.visafy.rule;

import com.visafy.common.domain.ReviewStatus;
import com.visafy.source.SourceDocument;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
public class RuleCandidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "source_document_id", nullable = false)
    private SourceDocument sourceDocument;

    @Column(nullable = false, length = 120)
    private String productCode;
    @Column(nullable = false, length = 120)
    private String ruleKey;
    @Column(nullable = false, length = 40)
    private String operator;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String ruleValue;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private RuleLevel ruleLevel;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String sourceExcerpt;
    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal confidence;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ReviewStatus reviewStatus;
    private Instant lastVerifiedAt;
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
    @Column(nullable = false)
    private Instant updatedAt;

    protected RuleCandidate() {
    }

    public RuleCandidate(SourceDocument sourceDocument, String productCode, String ruleKey, String operator,
                         String ruleValue, RuleLevel ruleLevel, String sourceExcerpt, BigDecimal confidence) {
        Instant now = Instant.now();
        this.sourceDocument = sourceDocument;
        this.productCode = productCode;
        this.ruleKey = ruleKey;
        this.operator = operator;
        this.ruleValue = ruleValue;
        this.ruleLevel = ruleLevel;
        this.sourceExcerpt = sourceExcerpt;
        this.confidence = confidence;
        this.reviewStatus = ReviewStatus.PENDING;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void applyCorrection(String operator, String ruleValue, String sourceExcerpt) {
        if (operator != null && !operator.isBlank()) this.operator = operator.strip();
        if (ruleValue != null && !ruleValue.isBlank()) this.ruleValue = ruleValue.strip();
        if (sourceExcerpt != null && !sourceExcerpt.isBlank()) this.sourceExcerpt = sourceExcerpt.strip();
        this.updatedAt = Instant.now();
    }

    public void approve() { reviewStatus = ReviewStatus.APPROVED; lastVerifiedAt = Instant.now(); updatedAt = lastVerifiedAt; }
    public void reject() { reviewStatus = ReviewStatus.REJECTED; lastVerifiedAt = Instant.now(); updatedAt = lastVerifiedAt; }
    public void markUnknown() { ruleLevel = RuleLevel.UNKNOWN; approve(); }
    public void requireReview() { reviewStatus = ReviewStatus.NEED_REVIEW; updatedAt = Instant.now(); }
    public void expire() { reviewStatus = ReviewStatus.EXPIRED; updatedAt = Instant.now(); }

    public Long getId() { return id; }
    public SourceDocument getSourceDocument() { return sourceDocument; }
    public String getProductCode() { return productCode; }
    public String getRuleKey() { return ruleKey; }
    public String getOperator() { return operator; }
    public String getRuleValue() { return ruleValue; }
    public RuleLevel getRuleLevel() { return ruleLevel; }
    public String getSourceExcerpt() { return sourceExcerpt; }
    public BigDecimal getConfidence() { return confidence; }
    public ReviewStatus getReviewStatus() { return reviewStatus; }
    public Instant getLastVerifiedAt() { return lastVerifiedAt; }
}
