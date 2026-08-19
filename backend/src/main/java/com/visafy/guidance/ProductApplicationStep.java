package com.visafy.guidance;

import com.visafy.common.domain.ReviewStatus;
import com.visafy.product.FinancialProduct;
import com.visafy.source.SourceDocument;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.time.Instant;
import java.time.LocalDate;

@Entity
public class ProductApplicationStep {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private FinancialProduct product;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "source_document_id", nullable = false)
    private SourceDocument sourceDocument;
    @Column(nullable = false)
    private int stepOrder;
    @Column(nullable = false)
    private String title;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    @Column(length = 120)
    private String channel;
    @Column(nullable = false, length = 500)
    private String sourceLocator;
    private LocalDate validFrom;
    private LocalDate validTo;
    @Column(nullable = false)
    private boolean active;
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
    @Column(nullable = false)
    private Instant updatedAt;

    protected ProductApplicationStep() {}

    public ProductApplicationStep(FinancialProduct product, SourceDocument sourceDocument, int stepOrder,
                                  String title, String description, String channel, String sourceLocator,
                                  LocalDate validFrom, LocalDate validTo, boolean active) {
        this.product = product;
        this.sourceDocument = sourceDocument;
        this.stepOrder = stepOrder;
        this.title = title;
        this.description = description;
        this.channel = channel;
        this.sourceLocator = sourceLocator;
        this.validFrom = validFrom;
        this.validTo = validTo;
        this.active = active;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public boolean isEffective(LocalDate today) {
        return active && sourceDocument.getReviewStatus() == ReviewStatus.APPROVED
                && sourceDocument.isEffective(today)
                && (validFrom == null || !validFrom.isAfter(today))
                && (validTo == null || !validTo.isBefore(today));
    }

    public Long getId() { return id; }
    public FinancialProduct getProduct() { return product; }
    public SourceDocument getSourceDocument() { return sourceDocument; }
    public int getStepOrder() { return stepOrder; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getChannel() { return channel; }
    public String getSourceLocator() { return sourceLocator; }
    public LocalDate getValidFrom() { return validFrom; }
    public LocalDate getValidTo() { return validTo; }
    public boolean isActive() { return active; }
}
