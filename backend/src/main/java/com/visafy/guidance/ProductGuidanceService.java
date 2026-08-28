package com.visafy.guidance;

import com.visafy.common.domain.ReviewStatus;
import com.visafy.eligibility.EligibilityResult;
import com.visafy.eligibility.EligibilityResult.RuleDetail;
import com.visafy.eligibility.EligibilityService;
import com.visafy.product.FinancialProduct;
import com.visafy.product.FinancialProductRepository;
import com.visafy.profile.TempProfile;
import com.visafy.profile.TempProfileService;
import com.visafy.source.SourceDocument;
import com.visafy.source.SourceDocumentService;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProductGuidanceService {
    private final FinancialProductRepository productRepository;
    private final ProductDocumentRequirementRepository documentRepository;
    private final ProductApplicationStepRepository stepRepository;
    private final SourceDocumentService sourceService;
    private final TempProfileService profileService;
    private final EligibilityService eligibilityService;

    public ProductGuidanceService(FinancialProductRepository productRepository,
                                  ProductDocumentRequirementRepository documentRepository,
                                  ProductApplicationStepRepository stepRepository,
                                  SourceDocumentService sourceService, TempProfileService profileService,
                                  EligibilityService eligibilityService) {
        this.productRepository = productRepository;
        this.documentRepository = documentRepository;
        this.stepRepository = stepRepository;
        this.sourceService = sourceService;
        this.profileService = profileService;
        this.eligibilityService = eligibilityService;
    }

    @Transactional
    public ProductDocumentRequirement createDocument(Long productId, String documentName, String description,
                                                     DocumentRequirementType type, String conditionRuleKey,
                                                     Long sourceDocumentId, String sourceLocator,
                                                     LocalDate validFrom, LocalDate validTo, boolean active) {
        FinancialProduct product = getProduct(productId, false);
        SourceDocument source = approvedSource(sourceDocumentId);
        validateDates(validFrom, validTo);
        String normalizedCondition = normalizeNullable(conditionRuleKey);
        if (type != DocumentRequirementType.CONDITIONAL && normalizedCondition != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only CONDITIONAL documents can reference a Rule key");
        }
        return documentRepository.save(new ProductDocumentRequirement(product, source, documentName.strip(),
                normalizeNullable(description), type, normalizedCondition, sourceLocator.strip(),
                validFrom, validTo, active));
    }

    @Transactional
    public ProductApplicationStep createStep(Long productId, int stepOrder, String title, String description,
                                             String channel, Long sourceDocumentId, String sourceLocator,
                                             LocalDate validFrom, LocalDate validTo, boolean active) {
        FinancialProduct product = getProduct(productId, false);
        SourceDocument source = approvedSource(sourceDocumentId);
        validateDates(validFrom, validTo);
        if (stepRepository.existsByProductIdAndStepOrder(productId, stepOrder)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Application step order already exists for this product");
        }
        return stepRepository.save(new ProductApplicationStep(product, source, stepOrder, title.strip(),
                description.strip(), normalizeNullable(channel), sourceLocator.strip(),
                validFrom, validTo, active));
    }

    public GuidanceResult getGeneral(Long productId, String language) {
        FinancialProduct product = getProduct(productId, true);
        return result(product, false, null, language);
    }

    public GuidanceResult getAdmin(Long productId) {
        FinancialProduct product = getProduct(productId, false);
        return result(product, false, null, "ko");
    }

    public GuidanceResult getPersonalized(Long productId, String profileSessionId) {
        FinancialProduct product = getProduct(productId, true);
        TempProfile profile = profileService.getBySessionId(profileSessionId.strip());
        EligibilityResult eligibility = eligibilityService.precheck(profile, product);
        Set<String> applicableKeys = Stream.of(eligibility.passedRules(), eligibility.externalChecks(),
                        eligibility.unknownRules(), eligibility.insufficientReasons())
                .flatMap(List::stream).map(RuleDetail::key)
                .filter(key -> key != null && !key.isBlank())
                .map(key -> key.toUpperCase(Locale.ROOT)).collect(Collectors.toSet());
        return result(product, true, applicableKeys, profile.getLanguage());
    }

    private GuidanceResult result(FinancialProduct product, boolean personalized,
                                  Set<String> applicableKeys, String language) {
        LocalDate today = LocalDate.now();
        List<ProductDocumentRequirement> allDocuments = documentRepository
                .findByProductIdAndActiveTrueOrderByIdAsc(product.getId()).stream()
                .filter(document -> document.isEffective(today)).toList();
        int excludedConditional = 0;
        if (personalized) {
            excludedConditional = (int) allDocuments.stream()
                    .filter(document -> document.getRequirementType() == DocumentRequirementType.CONDITIONAL)
                    .filter(document -> !applies(document, applicableKeys)).count();
            allDocuments = allDocuments.stream()
                    .filter(document -> document.getRequirementType() != DocumentRequirementType.CONDITIONAL
                            || applies(document, applicableKeys)).toList();
        }
        List<ProductApplicationStep> steps = stepRepository
                .findByProductIdAndActiveTrueOrderByStepOrderAsc(product.getId()).stream()
                .filter(step -> step.isEffective(today)).toList();
        return new GuidanceResult(product.getId(), personalized,
                mapDocuments(allDocuments, DocumentRequirementType.OFFICIAL_REQUIRED),
                mapDocuments(allDocuments, DocumentRequirementType.CONDITIONAL),
                mapDocuments(allDocuments, DocumentRequirementType.BANK_CONFIRMATION),
                steps.stream().map(StepView::from).toList(), excludedConditional, disclaimer(language));
    }

    private boolean applies(ProductDocumentRequirement document, Set<String> applicableKeys) {
        String key = document.getConditionRuleKey();
        return key == null || key.isBlank() || applicableKeys.contains(key.toUpperCase(Locale.ROOT));
    }

    private List<DocumentView> mapDocuments(List<ProductDocumentRequirement> documents,
                                             DocumentRequirementType type) {
        return documents.stream().filter(document -> document.getRequirementType() == type)
                .map(DocumentView::from).toList();
    }

    private FinancialProduct getProduct(Long productId, boolean publicOnly) {
        return productRepository.findOneById(productId)
                .filter(product -> !publicOnly || product.isActive())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    private SourceDocument approvedSource(Long sourceDocumentId) {
        SourceDocument source = sourceService.get(sourceDocumentId);
        if (source.getReviewStatus() != ReviewStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Guidance must reference an APPROVED official source");
        }
        return source;
    }

    private void validateDates(LocalDate validFrom, LocalDate validTo) {
        if (validFrom != null && validTo != null && validTo.isBefore(validFrom)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "validTo must be on or after validFrom");
        }
    }

    private String normalizeNullable(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }

    private String disclaimer(String language) {
        return switch (language == null ? "ko" : language.toLowerCase(Locale.ROOT)) {
            case "en" -> "Only documents confirmed by an approved official Source are shown. Conditional or bank-confirmation documents are not automatically promoted to official requirements.";
            case "vi" -> "Chỉ hiển thị tài liệu được xác nhận bởi nguồn chính thức đã duyệt. Tài liệu có điều kiện hoặc cần ngân hàng xác nhận không tự động được nâng thành tài liệu bắt buộc chính thức.";
            case "zh" -> "仅显示已在获批的官方来源中确认的材料。附条件材料或需银行确认的材料不会自动升级为官方必备材料。";
            case "ja" -> "承認済みの公式ソースで確認された書類のみを表示します。条件付き書類や銀行確認が必要な書類を公式の必須書類へ自動的に格上げすることはありません。";
            case "th" -> "แสดงเฉพาะเอกสารที่ยืนยันจากแหล่งข้อมูลอย่างเป็นทางการที่ผ่านการอนุมัติแล้ว เอกสารแบบมีเงื่อนไขหรือที่ต้องให้ธนาคารยืนยันจะไม่ถูกยกระดับเป็นเอกสารบังคับโดยอัตโนมัติ";
            default -> "승인된 공식 Source에서 확인된 서류만 표시합니다. 조건부 또는 은행 확인 서류를 공식 필수서류로 자동 승격하지 않습니다.";
        };
    }

    public record DocumentView(
            Long id, String documentName, String description, DocumentRequirementType requirementType,
            String conditionRuleKey, String sourceTitle, String sourceUrl, String sourceLocator,
            java.time.Instant verifiedAt
    ) {
        static DocumentView from(ProductDocumentRequirement document) {
            return new DocumentView(document.getId(), document.getDocumentName(), document.getDescription(),
                    document.getRequirementType(), document.getConditionRuleKey(),
                    document.getSourceDocument().getTitle(), document.getSourceDocument().getSourceUrl(),
                    document.getSourceLocator(), document.getVerifiedAt());
        }
    }

    public record StepView(
            Long id, int stepOrder, String title, String description, String channel,
            String sourceTitle, String sourceUrl, String sourceLocator
    ) {
        static StepView from(ProductApplicationStep step) {
            return new StepView(step.getId(), step.getStepOrder(), step.getTitle(), step.getDescription(),
                    step.getChannel(), step.getSourceDocument().getTitle(),
                    step.getSourceDocument().getSourceUrl(), step.getSourceLocator());
        }
    }

    public record GuidanceResult(
            Long productId, boolean personalized, List<DocumentView> officialRequired,
            List<DocumentView> conditional, List<DocumentView> bankConfirmation,
            List<StepView> applicationSteps, int excludedConditionalCount, String disclaimer
    ) {}
}
