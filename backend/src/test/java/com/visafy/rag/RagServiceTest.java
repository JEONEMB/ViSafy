package com.visafy.rag;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
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
import com.visafy.rag.RagAiClient.RagAnswerRequest;
import com.visafy.rag.RagAiClient.RagAnswerResponse;
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
class RagServiceTest {
    @Mock TempProfileService profileService;
    @Mock FinancialProductRepository productRepository;
    @Mock EligibilityService eligibilityService;
    @Mock RagAiClient aiClient;

    private TempProfile profile;
    private FinancialProduct product;
    private RagService service;

    @BeforeEach
    void setUp() {
        profile = profile();
        product = product();
        service = new RagService(profileService, productRepository, eligibilityService, aiClient);
        when(profileService.getBySessionId("session-uuid")).thenReturn(profile);
        when(productRepository.findOneById(10L)).thenReturn(Optional.of(product));
    }

    @Test
    void forwardsAuthoritativeEligibilityResultWithoutAllowingAiToReplaceIt() {
        RuleDetail visaRule = new RuleDetail(null, "VISA_TYPE", "VISA_TYPE_PASS",
                "F-5 체류자격 조건 충족", "F-5", "[\"F-2\",\"F-5\"]", true, false,
                "상품설명서 p.3", "https://www.kbstar.com/product", null);
        EligibilityResult eligibility = new EligibilityResult(EligibilityStatus.PUBLIC_CONDITIONS_MET,
                null, List.of(visaRule), List.of(), List.of(), List.of(), List.of(), "최종 승인이 아닙니다.");
        when(eligibilityService.precheck(profile, product)).thenReturn(eligibility);
        RagAnswerResponse expected = new RagAnswerResponse("answer", "PUBLIC_CONDITIONS_MET",
                visaRule.message(), List.of(), List.of("ELIGIBILITY_RESULT_IMMUTABLE"), "ko");
        when(aiClient.answer(any())).thenReturn(expected);

        RagAnswerResponse response = service.answer(" session-uuid ", 10L, "visa_type", "E-9 제한", 5);

        ArgumentCaptor<RagAnswerRequest> captor = ArgumentCaptor.forClass(RagAnswerRequest.class);
        verify(aiClient).answer(captor.capture());
        assertThat(response).isSameAs(expected);
        assertThat(captor.getValue().eligibilityStatus()).isEqualTo("PUBLIC_CONDITIONS_MET");
        assertThat(captor.getValue().ruleResult()).isEqualTo("F-5 체류자격 조건 충족");
        assertThat(captor.getValue().ruleKey()).isEqualTo("VISA_TYPE");
        assertThat(captor.getValue().language()).isEqualTo("ko");
        assertThat(captor.getValue().conversationContext()).isEmpty();
    }

    private static TempProfile profile() {
        TempProfile profile = new TempProfile("session-uuid");
        LocalDate today = LocalDate.now();
        profile.update(new ProfileData("VN", today.minusYears(30), "F-5", today.plusYears(1),
                today.minusYears(2), "Developer", "REGULAR", new BigDecimal("3000000"), 24,
                "ACCOUNT", "ko", true, "RENT", null, "KB"));
        return profile;
    }

    private static FinancialProduct product() {
        SourceDocument source = new SourceDocument("KB Bank", SourceType.PRODUCT_PAGE, "Official product",
                "https://www.kbstar.com/product", "snapshot", "a".repeat(64), null, null, "ko");
        source.review(ReviewStatus.APPROVED);
        return new FinancialProduct("KB_ACCOUNT", "KB Bank", "KB Account", ProductType.CHECKING_ACCOUNT,
                FinancialPurpose.ACCOUNT, "description", "target", source, true, true, LocalDate.now(),
                "conditions", "additional", "documents", "application");
    }
}
