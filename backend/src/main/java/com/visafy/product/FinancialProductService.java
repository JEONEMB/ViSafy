package com.visafy.product;

import com.visafy.common.domain.ReviewStatus;
import com.visafy.rule.RuleLevel;
import com.visafy.eligibility.RequiredProfileFields;
import com.visafy.source.SourceDocument;
import com.visafy.source.SourceDocumentService;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FinancialProductService {
    private final FinancialProductRepository repository;
    private final ProductRuleRepository ruleRepository;
    private final SourceDocumentService sourceService;

    public FinancialProductService(FinancialProductRepository repository, ProductRuleRepository ruleRepository,
                                   SourceDocumentService sourceService) {
        this.repository = repository;
        this.ruleRepository = ruleRepository;
        this.sourceService = sourceService;
    }

    @Transactional
    public FinancialProduct create(String productCode, String institution, String productName,
                                   ProductType productType, FinancialPurpose financialPurpose,
                                   String description, String targetSummary, Long sourceDocumentId,
                                   boolean active, boolean foreignerTarget, LocalDate informationBaseDate,
                                   String publicConditions, String additionalConditions,
                                   String requiredDocuments, String applicationMethod) {
        String normalizedCode = productCode.strip();
        if (repository.existsByProductCode(normalizedCode)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Product code already exists");
        }
        SourceDocument source = sourceService.get(sourceDocumentId);
        if (source.getReviewStatus() != ReviewStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A product must reference an APPROVED official source");
        }
        return repository.save(new FinancialProduct(normalizedCode, institution.strip(), productName.strip(),
                productType, financialPurpose, description.strip(), targetSummary.strip(), source, active,
                foreignerTarget, informationBaseDate, publicConditions.strip(), additionalConditions.strip(),
                requiredDocuments.strip(), applicationMethod.strip()));
    }

    public List<ProductView> findPublic(FinancialPurpose purpose, ProductType type, String institution,
                                        Boolean foreignerTarget, DiagnosisStatus diagnosisStatus) {
        return repository.findByActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::toView)
                .filter(view -> purpose == null || view.product().getFinancialPurpose() == purpose)
                .filter(view -> type == null || view.product().getProductType() == type)
                .filter(view -> institution == null || institution.isBlank()
                        || view.product().getInstitution().toLowerCase().contains(institution.strip().toLowerCase()))
                .filter(view -> foreignerTarget == null || view.product().isForeignerTarget() == foreignerTarget)
                .filter(view -> diagnosisStatus == null || view.diagnosisStatus() == diagnosisStatus)
                .toList();
    }

    public List<ProductView> findAdmin() {
        return repository.findAllByOrderByCreatedAtDesc().stream().map(this::toView).toList();
    }

    @Transactional
    public FinancialProduct update(Long id, String institution, String productName, ProductType productType,
                                   FinancialPurpose financialPurpose, String description, String targetSummary,
                                   Long sourceDocumentId, boolean active, boolean foreignerTarget,
                                   LocalDate informationBaseDate, String publicConditions,
                                   String additionalConditions, String requiredDocuments, String applicationMethod) {
        FinancialProduct product = getAdminEntity(id);
        SourceDocument source = sourceService.get(sourceDocumentId);
        if (source.getReviewStatus() != ReviewStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A product must reference an APPROVED official source");
        }
        product.update(institution.strip(), productName.strip(), productType, financialPurpose,
                description.strip(), targetSummary.strip(), source, active, foreignerTarget, informationBaseDate,
                publicConditions.strip(), additionalConditions.strip(), requiredDocuments.strip(),
                applicationMethod.strip());
        return product;
    }

    @Transactional
    public FinancialProduct deactivate(Long id) {
        FinancialProduct product = getAdminEntity(id);
        product.deactivate();
        return product;
    }

    public ProductView getAdmin(Long id) { return toView(getAdminEntity(id)); }

    private FinancialProduct getAdminEntity(Long id) {
        return repository.findOneById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    public ProductView getPublic(Long id) {
        FinancialProduct product = repository.findOneById(id)
                .filter(FinancialProduct::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        return toView(product);
    }

    private ProductView toView(FinancialProduct product) {
        List<ProductRule> rules = ruleRepository.findByProductIdAndActiveTrueOrderByRuleKeyAsc(product.getId())
                .stream().filter(rule -> rule.isEffective(LocalDate.now())).toList();
        DiagnosisStatus status = diagnose(rules);
        return new ProductView(product, rules, status, RequiredProfileFields.from(rules),
                diagnosisReason(status));
    }

    static DiagnosisStatus diagnose(List<ProductRule> rules) {
        if (rules.isEmpty()) return DiagnosisStatus.NOT_READY;
        boolean hasHardRule = rules.stream().anyMatch(rule -> rule.getRuleLevel() == RuleLevel.HARD);
        boolean hasUncertainRule = rules.stream().anyMatch(rule ->
                rule.isMandatory() && rule.getRuleLevel() != RuleLevel.HARD);
        return hasHardRule && !hasUncertainRule ? DiagnosisStatus.READY : DiagnosisStatus.PARTIAL;
    }

    private String diagnosisReason(DiagnosisStatus status) {
        return switch (status) {
            case READY -> "APPROVED_HARD_RULES_AVAILABLE";
            case PARTIAL -> "ADDITIONAL_CONFIRMATION_REQUIRED";
            case NOT_READY -> "SOURCE_INSUFFICIENT";
        };
    }

    public record ProductView(FinancialProduct product, List<ProductRule> rules,
                              DiagnosisStatus diagnosisStatus, List<String> requiredFields,
                              String diagnosisReasonCode) {
    }
}
