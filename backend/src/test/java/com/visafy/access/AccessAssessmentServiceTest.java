package com.visafy.access;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.visafy.common.domain.ReviewStatus;
import com.visafy.product.FinancialProduct;
import com.visafy.product.FinancialPurpose;
import com.visafy.product.ProductType;
import com.visafy.profile.TempProfile;
import com.visafy.rule.RuleCandidate;
import com.visafy.rule.RuleCandidateRepository;
import com.visafy.rule.RuleLevel;
import com.visafy.rule.RuleNature;
import com.visafy.rule.RuleOperator;
import com.visafy.source.SourceDocument;
import com.visafy.source.SourceType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

class AccessAssessmentServiceTest {
    private final RuleCandidateRepository repository = mock(RuleCandidateRepository.class);
    private final AccessAssessmentService service = new AccessAssessmentService(repository);

    @Test
    void realNameIndividualAloneNeverProvesForeignerAccess() {
        SourceDocument source = source();
        RuleCandidate information = candidate(source, "REAL_NAME_CUSTOMER", "true", RuleNature.INFORMATION,
                "가입대상: 실명의 개인");
        information.approve();
        FinancialProduct product = product(source);
        TempProfile profile = mock(TempProfile.class);
        when(profile.getLanguage()).thenReturn("ko");
        when(repository.findByProductCodeOrderByCreatedAtDesc("DEMO")).thenReturn(List.of(information));

        AccessAssessment result = service.assess(profile, product);

        assertThat(result.status()).isEqualTo(AccessStatus.ACCESS_UNKNOWN);
        assertThat(result.realNameGuardrailApplied()).isTrue();
        assertThat(result.details()).extracting(AccessAssessment.AccessDetail::messageCode)
                .contains("REAL_NAME_INDIVIDUAL_NOT_FOREIGNER_PROOF");
    }

    @Test
    void explicitForeignerAndOnlineEvidenceProducesOnlineAccess() {
        SourceDocument source = source();
        RuleCandidate foreigner = candidate(source, "IS_FOREIGNER", "true", RuleNature.HARD_ELIGIBILITY,
                "외국인 고객 가입 가능");
        RuleCandidate online = candidate(source, "FOREIGNER_ONLINE_AVAILABLE", "true", RuleNature.CHANNEL_REQUIREMENT,
                "외국인 고객은 모바일 앱에서 신청 가능");
        foreigner.approve(); online.approve();
        FinancialProduct product = product(source);
        TempProfile profile = mock(TempProfile.class);
        when(profile.getLanguage()).thenReturn("en");
        when(repository.findByProductCodeOrderByCreatedAtDesc("DEMO")).thenReturn(List.of(foreigner, online));

        AccessAssessment result = service.assess(profile, product);

        assertThat(result.status()).isEqualTo(AccessStatus.ACCESS_READY_ONLINE);
        assertThat(result.online()).isEqualTo(AccessAssessment.AccessAvailability.AVAILABLE);
        assertThat(result.realNameGuardrailApplied()).isFalse();
    }

    @Test
    void productLevelMobileEvidenceKeepsForeignerMobileAccessUnknown() {
        SourceDocument source = source();
        RuleCandidate identity = candidate(source, "RESIDENCE_CARD", "true", RuleNature.IDENTIFICATION_METHOD,
                "외국인등록증을 실명확인증표로 사용할 수 있음");
        RuleCandidate branch = candidate(source, "BRANCH_AVAILABLE", "true", RuleNature.CHANNEL_REQUIREMENT,
                "영업점에서 신규 가능");
        RuleCandidate productMobile = candidate(source, "MOBILE_APP", "true", RuleNature.CHANNEL_REQUIREMENT,
                "모바일 앱에서 상품 신규 가능");
        identity.approve(); branch.approve(); productMobile.approve();
        TempProfile profile = mock(TempProfile.class);
        when(profile.getLanguage()).thenReturn("ko");
        when(repository.findByProductCodeOrderByCreatedAtDesc("DEMO"))
                .thenReturn(List.of(identity, branch, productMobile));

        AccessAssessment result = service.assess(profile, product(source));

        assertThat(result.identification()).isEqualTo(AccessAssessment.AccessAvailability.AVAILABLE);
        assertThat(result.branch()).isEqualTo(AccessAssessment.AccessAvailability.AVAILABLE);
        assertThat(result.online()).isEqualTo(AccessAssessment.AccessAvailability.UNKNOWN);
        assertThat(result.status()).isEqualTo(AccessStatus.ACCESS_READY);
    }

    @Test
    void unconfirmedForeignerMobileStatementNeverBecomesAvailable() {
        SourceDocument source = source();
        RuleCandidate channel = candidate(source, "PRODUCT_NON_FACE_TO_FACE_CHANNEL", "true",
                RuleNature.CHANNEL_REQUIREMENT,
                "외국인 모바일 신규 가능 여부는 공식 자료에서 확인 필요");
        channel.approve();
        TempProfile profile = mock(TempProfile.class);
        when(profile.getLanguage()).thenReturn("ko");
        when(repository.findByProductCodeOrderByCreatedAtDesc("DEMO")).thenReturn(List.of(channel));

        AccessAssessment result = service.assess(profile, product(source));

        assertThat(result.online()).isEqualTo(AccessAssessment.AccessAvailability.UNKNOWN);
        assertThat(result.status()).isEqualTo(AccessStatus.ACCESS_UNKNOWN);
    }

    @Test
    void branchEvidenceNeverInventsMobileAvailability() {
        SourceDocument source = source();
        RuleCandidate branch = candidate(source, "BRANCH_ONLY", "true", RuleNature.CHANNEL_REQUIREMENT,
                "외국인은 영업점에서만 신청 가능");
        branch.approve();
        TempProfile profile = mock(TempProfile.class);
        when(profile.getLanguage()).thenReturn("ko");
        when(repository.findByProductCodeOrderByCreatedAtDesc("DEMO")).thenReturn(List.of(branch));

        AccessAssessment result = service.assess(profile, product(source));

        assertThat(result.status()).isEqualTo(AccessStatus.ACCESS_READY_BRANCH_ONLY);
        assertThat(result.branch()).isEqualTo(AccessAssessment.AccessAvailability.AVAILABLE);
        assertThat(result.online()).isEqualTo(AccessAssessment.AccessAvailability.UNKNOWN);
    }

    @Test
    void noOfficialAccessEvidenceRemainsUnknown() {
        SourceDocument source = source();
        TempProfile profile = mock(TempProfile.class);
        when(profile.getLanguage()).thenReturn("en");
        when(repository.findByProductCodeOrderByCreatedAtDesc("DEMO")).thenReturn(List.of());

        AccessAssessment result = service.assess(profile, product(source));

        assertThat(result.status()).isEqualTo(AccessStatus.ACCESS_UNKNOWN);
        assertThat(result.identification()).isEqualTo(AccessAssessment.AccessAvailability.UNKNOWN);
        assertThat(result.branch()).isEqualTo(AccessAssessment.AccessAvailability.UNKNOWN);
        assertThat(result.online()).isEqualTo(AccessAssessment.AccessAvailability.UNKNOWN);
    }

    private RuleCandidate candidate(SourceDocument source, String key, String value, RuleNature nature, String excerpt) {
        RuleLevel level = nature == RuleNature.HARD_ELIGIBILITY ? RuleLevel.HARD : RuleLevel.UNKNOWN;
        return new RuleCandidate(source, "DEMO", key, RuleOperator.EQ, value, level, nature, false,
                excerpt, "official section", null, "가입대상", null, null, excerpt, new BigDecimal("0.95"));
    }

    private SourceDocument source() {
        SourceDocument source = new SourceDocument("Demo Bank", SourceType.PRODUCT_PAGE, "Official page",
                "https://bank.example/product", "snapshot", "d".repeat(64), null, null, "ko");
        source.review(ReviewStatus.APPROVED);
        return source;
    }

    private FinancialProduct product(SourceDocument source) {
        return new FinancialProduct("DEMO", "Demo Bank", "Demo product", ProductType.SAVINGS,
                FinancialPurpose.SAVINGS, "description", "summary", source, true, false, LocalDate.now(),
                "conditions", "checks", "documents", "method");
    }
}
