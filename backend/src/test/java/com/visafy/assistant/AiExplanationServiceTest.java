package com.visafy.assistant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.visafy.assistant.AiExplanationClient.BankInquiry;
import com.visafy.assistant.AiExplanationClient.ConditionInput;
import com.visafy.assistant.AiExplanationClient.ExplanationRequest;
import com.visafy.assistant.AiExplanationClient.ExplanationResponse;
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
import com.visafy.source.SourceType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AiExplanationServiceTest {
    @Mock TempProfileService profileService;
    @Mock FinancialProductRepository productRepository;
    @Mock EligibilityService eligibilityService;
    @Mock AiExplanationClient aiClient;

    private TempProfile profile;
    private FinancialProduct product;
    private AiExplanationService service;

    @BeforeEach
    void setUp() {
        profile = profile();
        product = product();
        service = new AiExplanationService(profileService, productRepository, eligibilityService, aiClient);
        when(productRepository.findOneById(10L)).thenReturn(Optional.of(product));
    }

    @Test
    void sendsOnlyStructuredProfileValuesAndAuthoritativeEligibilityStatus() {
        when(profileService.getBySessionId("session-uuid")).thenReturn(profile);
        RuleDetail passed = detail("VISA_TYPE", "VISA_TYPE_PASS");
        RuleDetail external = detail("GUARANTEE", "EXTERNAL_CHECK");
        RuleDetail unknown = detail("VISA_DETAIL", "UNKNOWN");
        EligibilityResult eligibility = new EligibilityResult(EligibilityStatus.NEED_BANK_CONFIRMATION,
                10L, List.of(passed), List.of(), List.of(external), List.of(unknown), List.of(),
                "Not final approval");
        when(eligibilityService.precheck(profile, product)).thenReturn(eligibility);
        ExplanationResponse aiResponse = new ExplanationResponse("설명", List.of("다음 행동"), "면책", List.of(),
                new BankInquiry("한국어 문의", "English inquiry", "en", List.of("보증 확인")),
                List.of("STRUCTURED_NUMBERS_ONLY"));
        when(aiClient.explain(any())).thenReturn(aiResponse);

        AiExplanationService.ExplanationResult result = service.explain(" session-uuid ", 10L);

        ArgumentCaptor<ExplanationRequest> captor = ArgumentCaptor.forClass(ExplanationRequest.class);
        verify(aiClient).explain(captor.capture());
        ExplanationRequest request = captor.getValue();
        assertThat(request.eligibilityStatus()).isEqualTo("NEED_BANK_CONFIRMATION");
        assertThat(request.productId()).isEqualTo(10L);
        assertThat(request.accessResult().status()).isEqualTo("ACCESS_UNKNOWN");
        assertThat(request.visaType()).isEqualTo("E-9");
        assertThat(request.visaRemainingMonths()).isEqualTo(14);
        assertThat(request.residencyMonths()).isEqualTo(24);
        assertThat(request.termKeys()).contains("STATUS_OF_STAY", "GUARANTEE_INSURANCE_CERTIFICATE")
                .doesNotContain("PROOF_OF_INCOME");
        assertThat(request.ruleDetails()).extracting(ConditionInput::key)
                .containsExactly("VISA_TYPE", "GUARANTEE", "VISA_DETAIL");
        assertThat(request.ruleDetails().getFirst().sourceExcerpt()).isEqualTo("official excerpt");
        assertThat(result.facts().visaType()).isEqualTo("E-9");
        assertThat(result.inquiry().korean()).isEqualTo("한국어 문의");
    }

    @Test
    void generalProductWithoutVisaRuleDoesNotRequireOrInventVisaFacts() {
        TempProfile minimalProfile = new TempProfile("general-session");
        minimalProfile.update(new ProfileData("VN", null, null, null, null, null, null, null,
                null, "SAVE_MONEY", "en", false, null, null, null));
        when(profileService.getBySessionId("general-session")).thenReturn(minimalProfile);
        RuleDetail channel = detail("MOBILE_CHANNEL", "EXTERNAL_CHECK");
        EligibilityResult eligibility = new EligibilityResult(EligibilityStatus.NEED_BANK_CONFIRMATION,
                10L, List.of(), List.of(), List.of(channel), List.of(), List.of(), "Not final approval");
        when(eligibilityService.precheck(minimalProfile, product)).thenReturn(eligibility);
        when(aiClient.explain(any())).thenReturn(new ExplanationResponse("explanation", List.of("next"), "disclaimer",
                List.of(), null, List.of("NO_UNSOURCED_VISA_RULE")));

        AiExplanationService.ExplanationResult result = service.explain("general-session", 10L);

        ArgumentCaptor<ExplanationRequest> captor = ArgumentCaptor.forClass(ExplanationRequest.class);
        verify(aiClient).explain(captor.capture());
        assertThat(captor.getValue().visaType()).isNull();
        assertThat(captor.getValue().visaRemainingMonths()).isNull();
        assertThat(captor.getValue().residencyMonths()).isNull();
        assertThat(captor.getValue().termKeys()).doesNotContain("STATUS_OF_STAY");
        assertThat(result.facts().visaType()).isNull();
    }

    private static RuleDetail detail(String key, String code) {
        return new RuleDetail(null, key, code, code, "actual", "expected", true, false,
                "official excerpt", "p.3", "https://www.kbstar.com/source");
    }

    private static TempProfile profile() {
        TempProfile profile = new TempProfile("session-uuid");
        LocalDate today = LocalDate.now();
        profile.update(new ProfileData("VN", today.minusYears(30), "E-9", today.plusMonths(14),
                today.minusMonths(24), "Worker", "REGULAR", new BigDecimal("3000000"), 24,
                "LOAN", "en", true, "RENT", null, "A Bank"));
        return profile;
    }

    private static FinancialProduct product() {
        SourceDocument source = new SourceDocument("A Bank", SourceType.PRODUCT_PAGE, "Official product",
                "https://www.kbstar.com/product", "snapshot", "a".repeat(64), null, null, "ko");
        source.review(ReviewStatus.APPROVED);
        return new FinancialProduct("A_LOAN", "A Bank", "A Foreigner Loan", ProductType.LOAN,
                FinancialPurpose.LOAN, "description", "target", source, true, true, LocalDate.now(),
                "conditions", "additional", "documents", "application");
    }
}
