package com.visafy.product;

import com.visafy.rule.RuleCandidate;
import com.visafy.rule.RuleLevel;
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

@Entity
public class ProductRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rule_candidate_id", nullable = false, unique = true)
    private RuleCandidate ruleCandidate;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "source_document_id", nullable = false)
    private SourceDocument sourceDocument;
    @Column(nullable = false, length = 120)
    private String productCode;
    @Column(nullable = false, length = 120)
    private String ruleKey;
    @Column(nullable = false, length = 40)
    private String operator;
    @Lob @Column(nullable = false, columnDefinition = "TEXT")
    private String ruleValue;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private RuleLevel ruleLevel;
    @Lob @Column(nullable = false, columnDefinition = "TEXT")
    private String sourceExcerpt;
    @Column(nullable = false)
    private boolean active;
    @Column(nullable = false)
    private Instant lastVerifiedAt;
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
    @Column(nullable = false)
    private Instant updatedAt;

    protected ProductRule() {
    }

    public ProductRule(RuleCandidate candidate) {
        this.ruleCandidate = candidate;
        this.createdAt = Instant.now();
        synchronize(candidate, true);
    }

    public void synchronize(RuleCandidate candidate, boolean active) {
        this.sourceDocument = candidate.getSourceDocument();
        this.productCode = candidate.getProductCode();
        this.ruleKey = candidate.getRuleKey();
        this.operator = candidate.getOperator();
        this.ruleValue = candidate.getRuleValue();
        this.ruleLevel = candidate.getRuleLevel();
        this.sourceExcerpt = candidate.getSourceExcerpt();
        this.active = active;
        this.lastVerifiedAt = candidate.getLastVerifiedAt() == null ? Instant.now() : candidate.getLastVerifiedAt();
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getProductCode() { return productCode; }
    public String getRuleKey() { return ruleKey; }
    public String getOperator() { return operator; }
    public String getRuleValue() { return ruleValue; }
    public RuleLevel getRuleLevel() { return ruleLevel; }
    public String getSourceExcerpt() { return sourceExcerpt; }
    public Instant getLastVerifiedAt() { return lastVerifiedAt; }
}
