package com.visafy.product;

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
import java.time.Instant;
import java.time.LocalDate;

@Entity
public class FinancialProduct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String productCode;
    @Column(nullable = false, length = 120)
    private String institution;
    @Column(nullable = false)
    private String productName;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ProductType productType;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private FinancialPurpose financialPurpose;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ProductAudience productAudience;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ProductCategory productCategory;
    @Lob @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    @Lob @Column(nullable = false, columnDefinition = "TEXT")
    private String targetSummary;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "source_document_id", nullable = false)
    private SourceDocument sourceDocument;
    @Column(nullable = false)
    private boolean active;
    @Column(nullable = false)
    private boolean foreignerTarget;
    @Column(nullable = false)
    private LocalDate informationBaseDate;
    @Lob @Column(nullable = false, columnDefinition = "TEXT")
    private String publicConditions;
    @Lob @Column(nullable = false, columnDefinition = "TEXT")
    private String additionalConditions;
    @Lob @Column(nullable = false, columnDefinition = "TEXT")
    private String requiredDocuments;
    @Lob @Column(nullable = false, columnDefinition = "TEXT")
    private String applicationMethod;
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
    @Column(nullable = false)
    private Instant updatedAt;

    protected FinancialProduct() {
    }

    public FinancialProduct(String productCode, String institution, String productName, ProductType productType,
                            FinancialPurpose financialPurpose, String description, String targetSummary,
                            SourceDocument sourceDocument, boolean active, boolean foreignerTarget,
                            LocalDate informationBaseDate, String publicConditions, String additionalConditions,
                            String requiredDocuments, String applicationMethod) {
        this(productCode, institution, productName, productType, financialPurpose,
                foreignerTarget ? ProductAudience.FOREIGNER_SPECIALIZED : ProductAudience.GENERAL,
                defaultCategory(productType), description, targetSummary, sourceDocument, active,
                foreignerTarget, informationBaseDate, publicConditions, additionalConditions,
                requiredDocuments, applicationMethod);
    }

    public FinancialProduct(String productCode, String institution, String productName, ProductType productType,
                            FinancialPurpose financialPurpose, ProductAudience productAudience,
                            ProductCategory productCategory, String description, String targetSummary,
                            SourceDocument sourceDocument, boolean active, boolean foreignerTarget,
                            LocalDate informationBaseDate, String publicConditions, String additionalConditions,
                            String requiredDocuments, String applicationMethod) {
        Instant now = Instant.now();
        this.productCode = productCode;
        this.institution = institution;
        this.productName = productName;
        this.productType = productType;
        this.financialPurpose = financialPurpose;
        this.productAudience = productAudience;
        this.productCategory = productCategory;
        this.description = description;
        this.targetSummary = targetSummary;
        this.sourceDocument = sourceDocument;
        this.active = active;
        this.foreignerTarget = foreignerTarget;
        this.informationBaseDate = informationBaseDate;
        this.publicConditions = publicConditions;
        this.additionalConditions = additionalConditions;
        this.requiredDocuments = requiredDocuments;
        this.applicationMethod = applicationMethod;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void update(String institution, String productName, ProductType productType,
                       FinancialPurpose financialPurpose, String description, String targetSummary,
                       SourceDocument sourceDocument, boolean active, boolean foreignerTarget,
                       LocalDate informationBaseDate, String publicConditions, String additionalConditions,
                       String requiredDocuments, String applicationMethod) {
        this.institution = institution; this.productName = productName; this.productType = productType;
        this.financialPurpose = financialPurpose; this.description = description; this.targetSummary = targetSummary;
        this.sourceDocument = sourceDocument; this.active = active; this.foreignerTarget = foreignerTarget;
        this.informationBaseDate = informationBaseDate; this.publicConditions = publicConditions;
        this.additionalConditions = additionalConditions; this.requiredDocuments = requiredDocuments;
        this.applicationMethod = applicationMethod; this.updatedAt = Instant.now();
    }

    public void updateClassification(ProductAudience audience, ProductCategory category) {
        this.productAudience = audience == null
                ? (foreignerTarget ? ProductAudience.FOREIGNER_SPECIALIZED : ProductAudience.GENERAL) : audience;
        this.productCategory = category == null ? defaultCategory(productType) : category;
        this.updatedAt = Instant.now();
    }

    private static ProductCategory defaultCategory(ProductType type) {
        return switch (type) {
            case CHECKING_ACCOUNT -> ProductCategory.DEMAND_DEPOSIT;
            case SAVINGS -> ProductCategory.SAVINGS;
            case LOAN -> ProductCategory.PERSONAL_LOAN;
            case CARD -> ProductCategory.DEBIT_CARD;
            case INVESTMENT -> ProductCategory.SECURITIES;
            case REMITTANCE -> ProductCategory.REMITTANCE;
        };
    }

    public void deactivate() { this.active = false; this.updatedAt = Instant.now(); }

    public Long getId() { return id; }
    public String getProductCode() { return productCode; }
    public String getInstitution() { return institution; }
    public String getProductName() { return productName; }
    public ProductType getProductType() { return productType; }
    public FinancialPurpose getFinancialPurpose() { return financialPurpose; }
    public ProductAudience getProductAudience() { return productAudience; }
    public ProductCategory getProductCategory() { return productCategory; }
    public String getDescription() { return description; }
    public String getTargetSummary() { return targetSummary; }
    public SourceDocument getSourceDocument() { return sourceDocument; }
    public boolean isActive() { return active; }
    public boolean isForeignerTarget() { return foreignerTarget; }
    public LocalDate getInformationBaseDate() { return informationBaseDate; }
    public String getPublicConditions() { return publicConditions; }
    public String getAdditionalConditions() { return additionalConditions; }
    public String getRequiredDocuments() { return requiredDocuments; }
    public String getApplicationMethod() { return applicationMethod; }
    public Instant getUpdatedAt() { return updatedAt; }
}
