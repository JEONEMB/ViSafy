package com.visafy.product;

import com.visafy.product.FinancialProductService.ProductView;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import com.visafy.common.domain.ReviewStatus;
import com.visafy.rule.RuleLevel;
import com.visafy.rule.RuleOperator;
import com.visafy.rule.RuleNature;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api")
public class FinancialProductController {
    private final FinancialProductService service;

    public FinancialProductController(FinancialProductService service) {
        this.service = service;
    }

    @PostMapping("/admin/products")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody CreateProductRequest request) {
        FinancialProduct product = service.create(request.productCode(), request.institution(),
                request.productName(), request.productType(), request.financialPurpose(), request.description(),
                request.targetSummary(), request.sourceDocumentId(), request.active(), request.foreignerTarget(),
                request.informationBaseDate(), request.publicConditions(), request.additionalConditions(),
                request.requiredDocuments(), request.applicationMethod(), request.productAudience(),
                request.productCategory());
        service.updateOfficialApplicationUrl(product.getId(), request.officialApplicationUrl());
        return ProductResponse.from(service.findAdmin().stream()
                .filter(view -> view.product().getId().equals(product.getId())).findFirst().orElseThrow());
    }

    @GetMapping("/admin/products")
    public List<ProductResponse> findAdmin() {
        return service.findAdmin().stream().map(ProductResponse::from).toList();
    }

    @PutMapping("/admin/products/{id}")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody UpdateProductRequest request) {
        service.update(id, request.institution(), request.productName(), request.productType(),
                request.financialPurpose(), request.description(), request.targetSummary(), request.sourceDocumentId(),
                request.active(), request.foreignerTarget(), request.informationBaseDate(), request.publicConditions(),
                request.additionalConditions(), request.requiredDocuments(), request.applicationMethod(),
                request.productAudience(), request.productCategory());
        service.updateOfficialApplicationUrl(id, request.officialApplicationUrl());
        return ProductResponse.from(service.getAdmin(id));
    }

    @PutMapping("/admin/products/{id}/deactivate")
    public ProductResponse deactivate(@PathVariable Long id) {
        service.deactivate(id);
        return ProductResponse.from(service.getAdmin(id));
    }

    @GetMapping("/products")
    public List<ProductResponse> findAll(
            @RequestParam(required = false) FinancialPurpose financialPurpose,
            @RequestParam(required = false) ProductType productType,
            @RequestParam(required = false) String institution,
            @RequestParam(required = false) Boolean foreignerTarget,
            @RequestParam(required = false) DiagnosisStatus diagnosisStatus) {
        return service.findPublic(financialPurpose, productType, institution, foreignerTarget, diagnosisStatus)
                .stream().map(ProductResponse::from).toList();
    }

    @GetMapping("/products/{id}")
    public ProductResponse findOne(@PathVariable Long id) {
        return ProductResponse.from(service.getPublic(id));
    }

    public record CreateProductRequest(
            @NotBlank String productCode,
            @NotBlank String institution,
            @NotBlank String productName,
            @NotNull ProductType productType,
            @NotNull FinancialPurpose financialPurpose,
            @NotBlank String description,
            @NotBlank String targetSummary,
            @NotNull Long sourceDocumentId,
            boolean active,
            boolean foreignerTarget,
            @NotNull LocalDate informationBaseDate,
            @NotBlank String publicConditions,
            @NotBlank String additionalConditions,
            @NotBlank String requiredDocuments,
            @NotBlank String applicationMethod,
            ProductAudience productAudience,
            ProductCategory productCategory,
            String officialApplicationUrl
    ) {
    }

    public record UpdateProductRequest(
            @NotBlank String institution, @NotBlank String productName, @NotNull ProductType productType,
            @NotNull FinancialPurpose financialPurpose, @NotBlank String description,
            @NotBlank String targetSummary, @NotNull Long sourceDocumentId, boolean active,
            boolean foreignerTarget, @NotNull LocalDate informationBaseDate,
            @NotBlank String publicConditions, @NotBlank String additionalConditions,
            @NotBlank String requiredDocuments, @NotBlank String applicationMethod,
            ProductAudience productAudience, ProductCategory productCategory, String officialApplicationUrl
    ) {}

    public record ProductRuleResponse(
            Long id, Long productId, String ruleKey, RuleOperator operator, String ruleValue, RuleLevel ruleLevel,
            RuleNature ruleNature, boolean mandatory, Long sourceDocumentId, String sourceLocator,
            Integer pageNumber, String sectionName, LocalDate validFrom, LocalDate validTo,
            ReviewStatus reviewStatus, Instant verifiedAt, String reviewedBy, String description,
            String sourceExcerpt, RuleEvidenceResponse evidence
    ) {
        static ProductRuleResponse from(ProductRule rule) {
            return new ProductRuleResponse(rule.getId(), rule.getProduct().getId(), rule.getRuleKey(),
                    rule.getOperator(), rule.getRuleValue(), rule.getRuleLevel(), rule.getRuleNature(),
                    rule.isMandatory(), rule.getSourceDocument().getId(), rule.getSourceLocator(),
                    rule.getPageNumber(), rule.getSectionName(), rule.getValidFrom(),
                    rule.getValidTo(), rule.getReviewStatus(), rule.getVerifiedAt(), rule.getReviewedBy(),
                    rule.getDescription(), rule.getSourceExcerpt(), RuleEvidenceResponse.from(rule));
        }
    }

    public record RuleEvidenceResponse(
            Long ruleId, Long sourceDocumentId, String sourceExcerpt, String sourceLocator,
            Integer pageNumber, String sectionName, Instant verifiedAt, String reviewedBy
    ) {
        static RuleEvidenceResponse from(ProductRule rule) {
            return new RuleEvidenceResponse(rule.getId(), rule.getSourceDocument().getId(),
                    rule.getSourceExcerpt(), rule.getSourceLocator(), rule.getPageNumber(),
                    rule.getSectionName(), rule.getVerifiedAt(), rule.getReviewedBy());
        }
    }

    public record ProductResponse(
            Long id, String productCode, String institution, String productName, ProductType productType,
            FinancialPurpose financialPurpose, String description, String targetSummary, boolean active,
            ProductAudience productAudience, ProductCategory productCategory,
            boolean foreignerTarget, LocalDate informationBaseDate, String publicConditions,
            String additionalConditions, String requiredDocuments, String applicationMethod,
            String officialApplicationUrl,
            DiagnosisStatus diagnosisStatus, Long sourceDocumentId, String sourceTitle, String sourceUrl, Instant updatedAt,
            List<ProductRuleResponse> rules, List<String> requiredFields, Season3DataPackage dataPackage,
            String diagnosisReasonCode, SourceTrustSummary sourceTrust
    ) {
        static ProductResponse from(ProductView view) {
            FinancialProduct product = view.product();
            return new ProductResponse(product.getId(), product.getProductCode(), product.getInstitution(),
                    product.getProductName(), product.getProductType(), product.getFinancialPurpose(),
                    product.getDescription(), product.getTargetSummary(), product.isActive(),
                    product.getProductAudience(), product.getProductCategory(),
                    product.isForeignerTarget(), product.getInformationBaseDate(), product.getPublicConditions(),
                    product.getAdditionalConditions(), product.getRequiredDocuments(),
                    product.getApplicationMethod(), product.getOfficialApplicationUrl(), view.diagnosisStatus(), product.getSourceDocument().getId(),
                    product.getSourceDocument().getTitle(), product.getSourceDocument().getSourceUrl(),
                    product.getUpdatedAt(), view.rules().stream().map(ProductRuleResponse::from).toList(),
                    view.requiredFields(), view.dataPackage(), view.diagnosisReasonCode(), SourceTrustSummary.from(view));
        }
    }

    public record SourceTrustSummary(String freshnessStatus, Instant lastVerifiedAt, LocalDate validTo,
                                     int evidenceCoveragePercent, boolean ragEligible) {
        static SourceTrustSummary from(ProductView view) {
            FinancialProduct product = view.product();
            var source = product.getSourceDocument();
            long age = java.time.temporal.ChronoUnit.DAYS.between(
                    source.getLastVerifiedAt().atZone(java.time.ZoneOffset.UTC).toLocalDate(), LocalDate.now());
            String freshness = age <= 90 ? "FRESH" : age <= 180 ? "REVIEW_SOON" : "STALE";
            Season3DataPackage p = view.dataPackage();
            int present = (p.productPage() ? 1 : 0) + (p.termsOrDescription() ? 1 : 0)
                    + (p.hardRuleEvidence() ? 1 : 0) + (p.identityEvidence() ? 1 : 0)
                    + (p.channelEvidence() ? 1 : 0) + (p.documentEvidence() ? 1 : 0)
                    + (p.applicationStepEvidence() ? 1 : 0) + (p.informationBaseDate() ? 1 : 0);
            return new SourceTrustSummary(freshness, source.getLastVerifiedAt(), source.getValidTo(),
                    present * 100 / 8, source.isEffective(LocalDate.now()));
        }
    }
}
