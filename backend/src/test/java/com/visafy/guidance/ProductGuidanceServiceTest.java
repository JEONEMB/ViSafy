package com.visafy.guidance;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.visafy.common.domain.ReviewStatus;
import com.visafy.eligibility.EligibilityResult;
import com.visafy.eligibility.EligibilityResult.RuleDetail;
import com.visafy.eligibility.EligibilityService;
import com.visafy.eligibility.EligibilityStatus;
import com.visafy.product.FinancialProduct;
import com.visafy.product.FinancialProductRepository;
import com.visafy.product.FinancialPurpose;
import com.visafy.product.ProductType;
import com.visafy.profile.TempProfile;
import com.visafy.profile.TempProfile.ProfileData;
import com.visafy.profile.TempProfileService;
import com.visafy.source.SourceDocument;
import com.visafy.source.SourceDocumentService;
import com.visafy.source.SourceType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class ProductGuidanceServiceTest {
    @Mock FinancialProductRepository productRepository;
    @Mock ProductDocumentRequirementRepository documentRepository;
    @Mock ProductApplicationStepRepository stepRepository;
    @Mock SourceDocumentService sourceService;
    @Mock TempProfileService profileService;
    @Mock EligibilityService eligibilityService;

    private FinancialProduct product;
    private SourceDocument source;
    private TempProfile profile;
    private ProductGuidanceService service;

    @BeforeEach
    void setUp() {
        source = source();
        product = product(source);
        profile = profile();
        ReflectionTestUtils.setField(product, "id", 10L);
        service = new ProductGuidanceService(productRepository, documentRepository, stepRepository,
                sourceService, profileService, eligibilityService);
        when(productRepository.findOneById(10L)).thenReturn(Optional.of(product));
    }

    @Test
    void personalizedChecklistKeepsCategoriesAndFiltersOnlyConditionalDocuments() {
        ProductDocumentRequirement passport = document("Passport", DocumentRequirementType.OFFICIAL_REQUIRED, null);
        ProductDocumentRequirement income = document("Proof of income", DocumentRequirementType.CONDITIONAL,
                "MONTHLY_INCOME");
        ProductDocumentRequirement employment = document("Employment certificate",
                DocumentRequirementType.CONDITIONAL, "EMPLOYMENT_TYPE");
        ProductDocumentRequirement bank = document("Additional review documents",
                DocumentRequirementType.BANK_CONFIRMATION, null);
        ProductApplicationStep step = new ProductApplicationStep(product, source, 1, "Check documents",
                "Review the official checklist", "BRANCH", "Official page", null, null, true);
        when(documentRepository.findByProductIdAndActiveTrueOrderByIdAsc(10L))
                .thenReturn(List.of(passport, income, employment, bank));
        when(stepRepository.findByProductIdAndActiveTrueOrderByStepOrderAsc(10L)).thenReturn(List.of(step));
        when(profileService.getBySessionId("session-uuid")).thenReturn(profile);
        EligibilityResult eligibility = new EligibilityResult(EligibilityStatus.PUBLIC_CONDITIONS_NOT_MET, 10L,
                List.of(detail("MONTHLY_INCOME")), List.of(detail("EMPLOYMENT_TYPE")), List.of(), List.of(),
                List.of(), "Not final approval");
        when(eligibilityService.precheck(profile, product)).thenReturn(eligibility);

        ProductGuidanceService.GuidanceResult result = service.getPersonalized(10L, " session-uuid ");

        assertThat(result.officialRequired()).extracting(ProductGuidanceService.DocumentView::documentName)
                .containsExactly("Passport");
        assertThat(result.conditional()).extracting(ProductGuidanceService.DocumentView::documentName)
                .containsExactly("Proof of income");
        assertThat(result.bankConfirmation()).extracting(ProductGuidanceService.DocumentView::documentName)
                .containsExactly("Additional review documents");
        assertThat(result.excludedConditionalCount()).isEqualTo(1);
        assertThat(result.officialRequired().getFirst().sourceUrl()).isEqualTo("https://www.kbstar.com/product");
        assertThat(result.applicationSteps()).extracting(ProductGuidanceService.StepView::stepOrder)
                .containsExactly(1);
    }

    private ProductDocumentRequirement document(String name, DocumentRequirementType type, String conditionKey) {
        return new ProductDocumentRequirement(product, source, name, null, type, conditionKey,
                "Official page", null, null, true);
    }

    private static RuleDetail detail(String key) {
        return new RuleDetail(null, key, key, key, null, null, true, false,
                null, null, null);
    }

    private static SourceDocument source() {
        SourceDocument source = new SourceDocument("A Bank", SourceType.PRODUCT_PAGE, "Official product",
                "https://www.kbstar.com/product", "snapshot", "a".repeat(64), null, null, "ko");
        source.review(ReviewStatus.APPROVED);
        return source;
    }

    private static FinancialProduct product(SourceDocument source) {
        return new FinancialProduct("A_ACCOUNT", "A Bank", "A Account", ProductType.CHECKING_ACCOUNT,
                FinancialPurpose.ACCOUNT, "description", "target", source, true, true, LocalDate.now(),
                "conditions", "additional", "documents", "application");
    }

    private static TempProfile profile() {
        TempProfile profile = new TempProfile("session-uuid");
        LocalDate today = LocalDate.now();
        profile.update(new ProfileData("VN", today.minusYears(30), "E-9", today.plusMonths(14),
                today.minusMonths(24), "Worker", "REGULAR", new BigDecimal("3000000"), 24,
                "ACCOUNT", "en", true, "RENT", null, "A Bank"));
        return profile;
    }
}
