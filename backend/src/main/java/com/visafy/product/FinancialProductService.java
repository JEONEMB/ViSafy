package com.visafy.product;

import com.visafy.common.domain.ReviewStatus;
import com.visafy.rule.RuleLevel;
import com.visafy.eligibility.RequiredProfileFields;
import com.visafy.source.SourceDocument;
import com.visafy.source.SourceDocumentService;
import com.visafy.guidance.ProductApplicationStepRepository;
import com.visafy.guidance.ProductDocumentRequirementRepository;
import com.visafy.rule.RuleCandidate;
import com.visafy.rule.RuleCandidateRepository;
import com.visafy.rule.RuleNature;
import com.visafy.source.SourceType;
import java.util.ArrayList;
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
    private final RuleCandidateRepository candidateRepository;
    private final ProductDocumentRequirementRepository documentRepository;
    private final ProductApplicationStepRepository stepRepository;

    public FinancialProductService(FinancialProductRepository repository, ProductRuleRepository ruleRepository,
                                   SourceDocumentService sourceService, RuleCandidateRepository candidateRepository,
                                   ProductDocumentRequirementRepository documentRepository,
                                   ProductApplicationStepRepository stepRepository) {
        this.repository = repository;
        this.ruleRepository = ruleRepository;
        this.sourceService = sourceService;
        this.candidateRepository = candidateRepository;
        this.documentRepository = documentRepository;
        this.stepRepository = stepRepository;
    }

    @Transactional
    public FinancialProduct create(String productCode, String institution, String productName,
                                   ProductType productType, FinancialPurpose financialPurpose,
                                   String description, String targetSummary, Long sourceDocumentId,
                                   boolean active, boolean foreignerTarget, LocalDate informationBaseDate,
                                   String publicConditions, String additionalConditions,
                                   String requiredDocuments, String applicationMethod,
                                   ProductAudience productAudience, ProductCategory productCategory) {
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
                productType, financialPurpose,
                productAudience == null ? (foreignerTarget ? ProductAudience.FOREIGNER_SPECIALIZED : ProductAudience.GENERAL) : productAudience,
                productCategory == null ? defaultCategory(productType) : productCategory,
                description.strip(), targetSummary.strip(), source, active,
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
        return update(id, institution, productName, productType, financialPurpose, description, targetSummary,
                sourceDocumentId, active, foreignerTarget, informationBaseDate, publicConditions,
                additionalConditions, requiredDocuments, applicationMethod, null, null);
    }

    @Transactional
    public FinancialProduct update(Long id, String institution, String productName, ProductType productType,
                                   FinancialPurpose financialPurpose, String description, String targetSummary,
                                   Long sourceDocumentId, boolean active, boolean foreignerTarget,
                                   LocalDate informationBaseDate, String publicConditions,
                                   String additionalConditions, String requiredDocuments, String applicationMethod,
                                   ProductAudience productAudience, ProductCategory productCategory) {
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
        product.updateClassification(productAudience, productCategory);
        return product;
    }

    @Transactional
    public FinancialProduct deactivate(Long id) {
        FinancialProduct product = getAdminEntity(id);
        product.deactivate();
        return product;
    }

    @Transactional
    public FinancialProduct updateOfficialApplicationUrl(Long id, String url) {
        FinancialProduct product = getAdminEntity(id);
        if (url != null && !url.isBlank()) {
            sourceService.validateOfficialUrl(url);
        }
        product.updateOfficialApplicationUrl(url);
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
        Season3DataPackage dataPackage = dataPackage(product, rules);
        DiagnosisStatus status = diagnose(rules);
        if (status == DiagnosisStatus.READY && !dataPackage.complete()) status = DiagnosisStatus.PARTIAL;
        return new ProductView(product, rules, status, RequiredProfileFields.from(rules), dataPackage,
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

    private Season3DataPackage dataPackage(FinancialProduct product, List<ProductRule> rules) {
        LocalDate today = LocalDate.now();
        List<RuleCandidate> candidates = candidateRepository.findByProductCodeOrderByCreatedAtDesc(product.getProductCode())
                .stream().filter(candidate -> candidate.getReviewStatus() == ReviewStatus.APPROVED)
                .filter(candidate -> candidate.getSourceDocument().isEffective(today)).toList();
        boolean page = product.getSourceDocument().getSourceType() == SourceType.PRODUCT_PAGE
                || candidates.stream().anyMatch(candidate -> candidate.getSourceDocument().getSourceType() == SourceType.PRODUCT_PAGE);
        boolean terms = product.getSourceDocument().getSourceType() == SourceType.TERMS
                || product.getSourceDocument().getSourceType() == SourceType.PRODUCT_DESCRIPTION
                || candidates.stream().anyMatch(candidate -> candidate.getSourceDocument().getSourceType() == SourceType.TERMS
                || candidate.getSourceDocument().getSourceType() == SourceType.PRODUCT_DESCRIPTION);
        boolean hard = rules.stream().anyMatch(rule -> rule.getRuleLevel() == RuleLevel.HARD
                && rule.getSourceExcerpt() != null && !rule.getSourceExcerpt().isBlank());
        boolean identity = candidates.stream().anyMatch(candidate -> candidate.getRuleNature() == RuleNature.IDENTIFICATION_METHOD);
        boolean channel = candidates.stream().anyMatch(candidate -> candidate.getRuleNature() == RuleNature.CHANNEL_REQUIREMENT);
        boolean documents = candidates.stream().anyMatch(candidate -> candidate.getRuleNature() == RuleNature.REQUIRED_DOCUMENT)
                || !documentRepository.findByProductIdAndActiveTrueOrderByIdAsc(product.getId()).isEmpty();
        boolean steps = !stepRepository.findByProductIdAndActiveTrueOrderByStepOrderAsc(product.getId()).isEmpty();
        boolean baseDate = product.getInformationBaseDate() != null;
        List<String> missing = new ArrayList<>();
        if (!page) missing.add("OFFICIAL_PRODUCT_PAGE");
        if (!terms) missing.add("TERMS_OR_PRODUCT_DESCRIPTION");
        if (!hard) missing.add("HARD_RULE_EVIDENCE");
        if (!identity) missing.add("FOREIGNER_IDENTITY_EVIDENCE");
        if (!channel) missing.add("CHANNEL_EVIDENCE");
        if (!documents) missing.add("REQUIRED_DOCUMENT_EVIDENCE");
        if (!steps) missing.add("APPLICATION_STEP_EVIDENCE");
        if (!baseDate) missing.add("INFORMATION_BASE_DATE");
        return new Season3DataPackage(page, terms, hard, identity, channel, documents, steps, baseDate,
                List.copyOf(missing));
    }

    private ProductCategory defaultCategory(ProductType type) {
        return switch (type) {
            case CHECKING_ACCOUNT -> ProductCategory.DEMAND_DEPOSIT;
            case SAVINGS -> ProductCategory.SAVINGS;
            case LOAN -> ProductCategory.PERSONAL_LOAN;
            case CARD -> ProductCategory.DEBIT_CARD;
            case INVESTMENT -> ProductCategory.SECURITIES;
            case REMITTANCE -> ProductCategory.REMITTANCE;
        };
    }

    public record ProductView(FinancialProduct product, List<ProductRule> rules,
                              DiagnosisStatus diagnosisStatus, List<String> requiredFields,
                              Season3DataPackage dataPackage,
                              String diagnosisReasonCode) {
    }
}
