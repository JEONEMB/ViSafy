package com.visafy.source;

import com.visafy.common.domain.ReviewStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import java.time.Instant;
import java.time.LocalDate;

@Entity
public class SourceDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String institution;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private SourceType sourceType;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String sourceUrl;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String snapshotText;

    @Column(nullable = false, length = 64, unique = true)
    private String contentHash;

    @Column(nullable = false)
    private Instant retrievedAt;

    private LocalDate validFrom;
    private LocalDate validTo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ReviewStatus reviewStatus;

    @Column(nullable = false)
    private Instant lastVerifiedAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected SourceDocument() {
    }

    public SourceDocument(String institution, SourceType sourceType, String title, String sourceUrl,
                          String snapshotText, String contentHash, LocalDate validFrom, LocalDate validTo) {
        Instant now = Instant.now();
        this.institution = institution;
        this.sourceType = sourceType;
        this.title = title;
        this.sourceUrl = sourceUrl;
        this.snapshotText = snapshotText;
        this.contentHash = contentHash;
        this.retrievedAt = now;
        this.validFrom = validFrom;
        this.validTo = validTo;
        this.reviewStatus = ReviewStatus.PENDING;
        this.lastVerifiedAt = now;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void expireIfNeeded(LocalDate today) {
        if (validTo != null && validTo.isBefore(today) && reviewStatus != ReviewStatus.EXPIRED) {
            reviewStatus = ReviewStatus.EXPIRED;
            updatedAt = Instant.now();
        }
    }

    public void review(ReviewStatus status) {
        if (status != ReviewStatus.APPROVED && status != ReviewStatus.REJECTED && status != ReviewStatus.NEED_REVIEW) {
            throw new IllegalArgumentException("Unsupported source review status");
        }
        reviewStatus = status;
        lastVerifiedAt = Instant.now();
        updatedAt = lastVerifiedAt;
    }

    public boolean isEffective(LocalDate date) {
        return reviewStatus == ReviewStatus.APPROVED
                && (validFrom == null || !validFrom.isAfter(date))
                && (validTo == null || !validTo.isBefore(date));
    }

    public Long getId() { return id; }
    public String getInstitution() { return institution; }
    public SourceType getSourceType() { return sourceType; }
    public String getTitle() { return title; }
    public String getSourceUrl() { return sourceUrl; }
    public String getSnapshotText() { return snapshotText; }
    public String getContentHash() { return contentHash; }
    public Instant getRetrievedAt() { return retrievedAt; }
    public LocalDate getValidFrom() { return validFrom; }
    public LocalDate getValidTo() { return validTo; }
    public ReviewStatus getReviewStatus() { return reviewStatus; }
    public Instant getLastVerifiedAt() { return lastVerifiedAt; }
}
