package com.visafy.eligibility;

import com.visafy.eligibility.EligibilityResult.RuleDetail;
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
import jakarta.persistence.Table;

@Entity
@Table(name = "precheck_rule_result")
public class PrecheckRuleResultEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "precheck_result_id", nullable = false)
    private PrecheckResultEntity precheckResult;
    @Column(name = "product_rule_id")
    private Long productRuleId;
    @Column(nullable = false, length = 120)
    private String ruleKey;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 40)
    private PrecheckRuleOutcome result;
    @Column(nullable = false, length = 120)
    private String messageCode;
    @Lob @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    @Column(length = 1000)
    private String actualValue;
    @Column(length = 1000)
    private String expectedValue;
    @Column(nullable = false)
    private boolean mandatory;
    @Column(nullable = false)
    private boolean blocking;
    @Lob @Column(columnDefinition = "TEXT")
    private String sourceExcerpt;
    @Column(length = 500)
    private String sourceLocator;
    @Column(length = 1000)
    private String sourceUrl;

    protected PrecheckRuleResultEntity() {}

    PrecheckRuleResultEntity(PrecheckResultEntity parent, PrecheckRuleOutcome outcome, RuleDetail detail) {
        this.precheckResult = parent; this.productRuleId = detail.ruleId(); this.ruleKey = detail.key();
        this.result = outcome; this.messageCode = detail.messageCode(); this.message = detail.message();
        this.actualValue = detail.actualValue(); this.expectedValue = detail.expectedValue();
        this.mandatory = detail.mandatory(); this.blocking = detail.blocking();
        this.sourceExcerpt = detail.sourceExcerpt(); this.sourceLocator = detail.sourceLocator();
        this.sourceUrl = detail.sourceUrl();
    }

    public PrecheckRuleOutcome getResult() { return result; }
    public RuleDetail toDetail() { return new RuleDetail(productRuleId, ruleKey, messageCode, message, actualValue,
            expectedValue, mandatory, blocking, sourceExcerpt, sourceLocator, sourceUrl); }
}
