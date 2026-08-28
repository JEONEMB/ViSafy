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
    /** Reviewer recorded when a new snapshot of the same URL arrives with a different content hash. */
    public static final String CONTENT_CHANGE_REVIEWER = "content-change-detector";

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

    @Column(length = 1000)
    private String snapshotPath;

    @Column(nullable = false, length = 64, unique = true)
    private String contentHash;

    @Column(nullable = false)
    private Instant retrievedAt;

    @Column(nullable = false)
    private LocalDate informationBaseDate;

    private LocalDate validFrom;
    private LocalDate validTo;

    @Column(nullable = false, length = 10)
    private String language;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ReviewStatus reviewStatus;

    @Column(nullable = false)
    private Instant lastVerifiedAt;

    @Column(length = 120)
    private String reviewedBy;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected SourceDocument() {
    }

    public SourceDocument(String institution, SourceType sourceType, String title, String sourceUrl,
                          String snapshotText, String contentHash, LocalDate validFrom, LocalDate validTo,
                          String language) {
        this(institution, sourceType, title, sourceUrl, snapshotText, null, contentHash,
                LocalDate.now(), validFrom, validTo, language);
    }

    public SourceDocument(String institution, SourceType sourceType, String title, String sourceUrl,
                          String snapshotText, String snapshotPath, String contentHash,
                          LocalDate informationBaseDate, LocalDate validFrom, LocalDate validTo,
                          String language) {
        Instant now = Instant.now();
        this.institution = institution;
        this.sourceType = sourceType;
        this.title = title;
        this.sourceUrl = sourceUrl;
        this.snapshotText = snapshotText;
        this.snapshotPath = snapshotPath;
        this.contentHash = contentHash;
        this.retrievedAt = now;
        this.informationBaseDate = informationBaseDate;
        this.validFrom = validFrom;
        this.validTo = validTo;
        this.language = language;
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
        review(status, "system");
    }

    public void review(ReviewStatus status, String reviewer) {
        if (status != ReviewStatus.APPROVED && status != ReviewStatus.REJECTED
                && status != ReviewStatus.NEED_REVIEW && status != ReviewStatus.SUPERSEDED
                && status != ReviewStatus.UNKNOWN) {
            throw new IllegalArgumentException("Unsupported source review status");
        }
        reviewStatus = status;
        reviewedBy = reviewer == null || reviewer.isBlank() ? "system" : reviewer.strip();
        lastVerifiedAt = Instant.now();
        updatedAt = lastVerifiedAt;
    }

    public void updateMetadata(String institution, SourceType sourceType, String title, String sourceUrl,
                               LocalDate informationBaseDate, LocalDate validFrom, LocalDate validTo,
                               String language) {
        this.institution = institution; this.sourceType = sourceType; this.title = title; this.sourceUrl = sourceUrl;
        this.informationBaseDate = informationBaseDate;
        this.validFrom = validFrom; this.validTo = validTo; this.language = language;
        this.lastVerifiedAt = Instant.now(); this.updatedAt = this.lastVerifiedAt;
        if (validTo != null && validTo.isBefore(LocalDate.now())) this.reviewStatus = ReviewStatus.EXPIRED;
    }

    public void markExpired() { this.reviewStatus = ReviewStatus.EXPIRED; this.lastVerifiedAt = Instant.now(); this.updatedAt = this.lastVerifiedAt; }

    public SourceLifecycleStatus getLifecycleStatus() {
        if (reviewStatus == ReviewStatus.EXPIRED || (validTo != null && validTo.isBefore(LocalDate.now()))) return SourceLifecycleStatus.EXPIRED;
        return switch (reviewStatus) {
            case APPROVED -> SourceLifecycleStatus.ACTIVE;
            case NEED_REVIEW -> SourceLifecycleStatus.NEED_REVIEW;
            case REJECTED -> SourceLifecycleStatus.REJECTED;
            case SUPERSEDED -> SourceLifecycleStatus.SUPERSEDED;
            case UNKNOWN -> SourceLifecycleStatus.UNKNOWN;
            default -> SourceLifecycleStatus.PENDING;
        };
    }

    /**
     * True while this snapshot is held for re-review because the official page changed underneath it.
     */
    public boolean awaitsReviewAfterContentChange() {
        return reviewStatus == ReviewStatus.NEED_REVIEW && CONTENT_CHANGE_REVIEWER.equals(reviewedBy);
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
    public String getSnapshotPath() { return snapshotPath; }
    public String getContentHash() { return contentHash; }
    public Instant getRetrievedAt() { return retrievedAt; }
    public LocalDate getInformationBaseDate() { return informationBaseDate; }
    public LocalDate getValidFrom() { return validFrom; }
    public LocalDate getValidTo() { return validTo; }
    public String getLanguage() { return language; }
    public ReviewStatus getReviewStatus() { return reviewStatus; }
    public Instant getLastVerifiedAt() { return lastVerifiedAt; }
    public String getReviewedBy() { return reviewedBy; }
}
