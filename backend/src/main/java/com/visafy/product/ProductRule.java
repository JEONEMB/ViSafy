package com.visafy.product;

import com.visafy.rule.RuleCandidate;
import com.visafy.rule.RuleLevel;
import com.visafy.rule.RuleOperator;
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
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import java.time.Instant;
import java.time.LocalDate;

@Entity
public class ProductRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rule_candidate_id", nullable = false, unique = true)
    private RuleCandidate ruleCandidate;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private FinancialProduct product;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "source_document_id", nullable = false)
    private SourceDocument sourceDocument;
    @Column(nullable = false, length = 120)
    private String ruleKey;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private RuleOperator operator;
    @Lob @Column(nullable = false, columnDefinition = "TEXT")
    private String ruleValue;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private RuleLevel ruleLevel;
    @Column(nullable = false)
    private boolean mandatory;
    @Lob @Column(nullable = false, columnDefinition = "TEXT")
    private String sourceExcerpt;
    @Column(nullable = false, length = 500)
    private String sourceLocator;
    private LocalDate validFrom;
    private LocalDate validTo;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ReviewStatus reviewStatus;
    @Lob @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    @Column(nullable = false)
    private boolean active;
    @Column(nullable = false)
    private Instant verifiedAt;
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
    @Column(nullable = false)
    private Instant updatedAt;

    protected ProductRule() {
    }

    public ProductRule(FinancialProduct product, RuleCandidate candidate) {
        this.ruleCandidate = candidate;
        this.product = product;
        this.createdAt = Instant.now();
        synchronize(product, candidate, true);
    }

    public void synchronize(FinancialProduct product, RuleCandidate candidate, boolean active) {
        this.product = product;
        this.sourceDocument = candidate.getSourceDocument();
        this.ruleKey = candidate.getRuleKey();
        this.operator = candidate.getOperator();
        this.ruleValue = candidate.getRuleValue();
        this.ruleLevel = candidate.getRuleLevel();
        this.mandatory = candidate.isMandatory();
        this.sourceExcerpt = candidate.getSourceExcerpt();
        this.sourceLocator = candidate.getSourceLocator();
        this.validFrom = candidate.getValidFrom();
        this.validTo = candidate.getValidTo();
        this.reviewStatus = candidate.getReviewStatus();
        this.description = candidate.getDescription();
        this.active = active;
        this.verifiedAt = candidate.getLastVerifiedAt() == null ? Instant.now() : candidate.getLastVerifiedAt();
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public FinancialProduct getProduct() { return product; }
    public SourceDocument getSourceDocument() { return sourceDocument; }
    public String getRuleKey() { return ruleKey; }
    public RuleOperator getOperator() { return operator; }
    public String getRuleValue() { return ruleValue; }
    public RuleLevel getRuleLevel() { return ruleLevel; }
    public boolean isMandatory() { return mandatory; }
    public String getSourceExcerpt() { return sourceExcerpt; }
    public String getSourceLocator() { return sourceLocator; }
    public LocalDate getValidFrom() { return validFrom; }
    public LocalDate getValidTo() { return validTo; }
    public ReviewStatus getReviewStatus() { return reviewStatus; }
    public Instant getVerifiedAt() { return verifiedAt; }
    public String getDescription() { return description; }
    public boolean isEffective(LocalDate date) {
        return active && reviewStatus == ReviewStatus.APPROVED
                && sourceDocument.isEffective(date)
                && (validFrom == null || !validFrom.isAfter(date))
                && (validTo == null || !validTo.isBefore(date));
    }
}
