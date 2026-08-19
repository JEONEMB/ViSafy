package com.visafy.rule;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import java.time.Instant;

@Entity
public class RuleChangeHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rule_candidate_id", nullable = false)
    private RuleCandidate ruleCandidate;
    @Column(nullable = false, length = 40)
    private String action;
    @Column(nullable = false, length = 120)
    private String reviewer;
    @Column(length = 40) private String beforeOperator;
    @Lob @Column(columnDefinition = "TEXT") private String beforeValue;
    @Column(length = 40) private String beforeLevel;
    @Column(length = 40) private String beforeStatus;
    @Column(length = 40) private String afterOperator;
    @Lob @Column(columnDefinition = "TEXT") private String afterValue;
    @Column(length = 40) private String afterLevel;
    @Column(length = 40) private String afterStatus;
    @Column(nullable = false, updatable = false)
    private Instant reviewedAt;

    protected RuleChangeHistory() {}
    RuleChangeHistory(RuleCandidate candidate, String action, String reviewer,
                      RuleSnapshot before, RuleSnapshot after) {
        this.ruleCandidate = candidate; this.action = action; this.reviewer = reviewer;
        this.beforeOperator = before.operator(); this.beforeValue = before.value();
        this.beforeLevel = before.level(); this.beforeStatus = before.status();
        this.afterOperator = after.operator(); this.afterValue = after.value();
        this.afterLevel = after.level(); this.afterStatus = after.status(); this.reviewedAt = Instant.now();
    }
    public static RuleSnapshot snapshot(RuleCandidate candidate) {
        return new RuleSnapshot(candidate.getOperator().name(), candidate.getRuleValue(),
                candidate.getRuleLevel().name(), candidate.getReviewStatus().name());
    }
    public Long getId() { return id; }
    public RuleCandidate getRuleCandidate() { return ruleCandidate; }
    public String getAction() { return action; }
    public String getReviewer() { return reviewer; }
    public String getBeforeOperator() { return beforeOperator; }
    public String getBeforeValue() { return beforeValue; }
    public String getBeforeLevel() { return beforeLevel; }
    public String getBeforeStatus() { return beforeStatus; }
    public String getAfterOperator() { return afterOperator; }
    public String getAfterValue() { return afterValue; }
    public String getAfterLevel() { return afterLevel; }
    public String getAfterStatus() { return afterStatus; }
    public Instant getReviewedAt() { return reviewedAt; }
    public record RuleSnapshot(String operator, String value, String level, String status) {}
}
