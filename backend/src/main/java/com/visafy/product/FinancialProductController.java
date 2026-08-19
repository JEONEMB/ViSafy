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
                request.requiredDocuments(), request.applicationMethod());
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
                request.additionalConditions(), request.requiredDocuments(), request.applicationMethod());
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
            @NotBlank String applicationMethod
    ) {
    }

    public record UpdateProductRequest(
            @NotBlank String institution, @NotBlank String productName, @NotNull ProductType productType,
            @NotNull FinancialPurpose financialPurpose, @NotBlank String description,
            @NotBlank String targetSummary, @NotNull Long sourceDocumentId, boolean active,
            boolean foreignerTarget, @NotNull LocalDate informationBaseDate,
            @NotBlank String publicConditions, @NotBlank String additionalConditions,
            @NotBlank String requiredDocuments, @NotBlank String applicationMethod
    ) {}

    public record ProductRuleResponse(
            Long id, Long productId, String ruleKey, RuleOperator operator, String ruleValue, RuleLevel ruleLevel,
            boolean mandatory, Long sourceDocumentId, String sourceLocator, LocalDate validFrom, LocalDate validTo,
            ReviewStatus reviewStatus, Instant verifiedAt, String description, String sourceExcerpt
    ) {
        static ProductRuleResponse from(ProductRule rule) {
            return new ProductRuleResponse(rule.getId(), rule.getProduct().getId(), rule.getRuleKey(),
                    rule.getOperator(), rule.getRuleValue(), rule.getRuleLevel(), rule.isMandatory(),
                    rule.getSourceDocument().getId(), rule.getSourceLocator(), rule.getValidFrom(),
                    rule.getValidTo(), rule.getReviewStatus(), rule.getVerifiedAt(), rule.getDescription(),
                    rule.getSourceExcerpt());
        }
    }

    public record ProductResponse(
            Long id, String productCode, String institution, String productName, ProductType productType,
            FinancialPurpose financialPurpose, String description, String targetSummary, boolean active,
            boolean foreignerTarget, LocalDate informationBaseDate, String publicConditions,
            String additionalConditions, String requiredDocuments, String applicationMethod,
            DiagnosisStatus diagnosisStatus, Long sourceDocumentId, String sourceTitle, String sourceUrl, Instant updatedAt,
            List<ProductRuleResponse> rules
    ) {
        static ProductResponse from(ProductView view) {
            FinancialProduct product = view.product();
            return new ProductResponse(product.getId(), product.getProductCode(), product.getInstitution(),
                    product.getProductName(), product.getProductType(), product.getFinancialPurpose(),
                    product.getDescription(), product.getTargetSummary(), product.isActive(),
                    product.isForeignerTarget(), product.getInformationBaseDate(), product.getPublicConditions(),
                    product.getAdditionalConditions(), product.getRequiredDocuments(),
                    product.getApplicationMethod(), view.diagnosisStatus(), product.getSourceDocument().getId(),
                    product.getSourceDocument().getTitle(), product.getSourceDocument().getSourceUrl(),
                    product.getUpdatedAt(), view.rules().stream().map(ProductRuleResponse::from).toList());
        }
    }
}
