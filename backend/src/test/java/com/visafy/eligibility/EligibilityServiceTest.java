package com.visafy.eligibility;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visafy.common.domain.ReviewStatus;
import com.visafy.product.FinancialProduct;
import com.visafy.product.FinancialProductRepository;
import com.visafy.product.FinancialPurpose;
import com.visafy.product.ProductRule;
import com.visafy.product.ProductRuleRepository;
import com.visafy.product.ProductType;
import com.visafy.profile.TempProfile;
import com.visafy.profile.TempProfile.ProfileData;
import com.visafy.profile.TempProfileService;
import com.visafy.rule.RuleCandidate;
import com.visafy.rule.RuleCandidateRepository;
import com.visafy.rule.RuleLevel;
import com.visafy.rule.RuleOperator;
import com.visafy.source.SourceDocument;
import com.visafy.source.SourceType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(MockitoExtension.class)
class EligibilityServiceTest {
    @Mock TempProfileService profileService;
    @Mock FinancialProductRepository productRepository;
    @Mock ProductRuleRepository ruleRepository;
    @Mock RuleCandidateRepository candidateRepository;

    private SourceDocument source;
    private FinancialProduct product;
    private TempProfile profile;
    private EligibilityService service;

    @BeforeEach
    void setUp() {
        source = approvedSource();
        product = product(source);
        profile = profile("en");
        service = new EligibilityService(profileService, productRepository, ruleRepository,
                candidateRepository, new ObjectMapper());
        when(profileService.getBySessionId("session")).thenReturn(profile);
        when(productRepository.findOneById(1L)).thenReturn(Optional.of(product));
        when(candidateRepository.findByProductCodeOrderByCreatedAtDesc("DEMO")).thenReturn(List.of());
    }

    @Test
    void allHardRulesPassingReturnsMet() {
        when(ruleRepository.findByProductIdAndActiveTrueOrderByRuleKeyAsc(1L)).thenReturn(List.of(
                rule("VISA_TYPE", RuleOperator.IN, "[\"F-2\",\"F-5\"]", RuleLevel.HARD, true),
                rule("AGE", RuleOperator.GTE, "19", RuleLevel.HARD, true)));

        EligibilityResult result = service.precheck("session", 1L);

        assertThat(result.status()).isEqualTo(EligibilityStatus.PUBLIC_CONDITIONS_MET);
        assertThat(result.passedRules()).hasSize(2);
        assertThat(result.disclaimer()).contains("not final approval");
    }

    @Test
    void explicitHardFailureWinsOverIncompleteReview() {
        RuleCandidate pending = candidate("AGE", RuleOperator.GTE, "19", RuleLevel.HARD, true);
        when(candidateRepository.findByProductCodeOrderByCreatedAtDesc("DEMO")).thenReturn(List.of(pending));
        when(ruleRepository.findByProductIdAndActiveTrueOrderByRuleKeyAsc(1L)).thenReturn(List.of(
                rule("VISA_TYPE", RuleOperator.IN, "[\"D-2\"]", RuleLevel.HARD, true)));

        EligibilityResult result = service.precheck("session", 1L);

        assertThat(result.status()).isEqualTo(EligibilityStatus.PUBLIC_CONDITIONS_NOT_MET);
        assertThat(result.failedRules()).hasSize(1);
        assertThat(result.insufficientReasons()).extracting(EligibilityResult.RuleDetail::messageCode)
                .contains("RULE_REVIEW_INCOMPLETE");
    }

    @Test
    void externalCheckAndMandatoryUnknownRequireBankConfirmation() {
        when(ruleRepository.findByProductIdAndActiveTrueOrderByRuleKeyAsc(1L)).thenReturn(List.of(
                rule("VISA_TYPE", RuleOperator.IN, "[\"F-5\"]", RuleLevel.HARD, true),
                rule("GUARANTEE", RuleOperator.EXISTS, "true", RuleLevel.EXTERNAL_CHECK, true),
                rule("VISA_DETAIL", RuleOperator.EXISTS, "true", RuleLevel.UNKNOWN, true)));

        EligibilityResult result = service.precheck("session", 1L);

        assertThat(result.status()).isEqualTo(EligibilityStatus.NEED_BANK_CONFIRMATION);
        assertThat(result.externalChecks()).hasSize(1);
        assertThat(result.unknownRules()).singleElement().satisfies(detail ->
                assertThat(detail.message()).contains("visa F-5"));
    }

    @Test
    void optionalUnknownDoesNotBlockMetStatus() {
        when(ruleRepository.findByProductIdAndActiveTrueOrderByRuleKeyAsc(1L)).thenReturn(List.of(
                rule("VISA_TYPE", RuleOperator.IN, "[\"F-5\"]", RuleLevel.HARD, true),
                rule("OPTIONAL_POLICY", RuleOperator.EXISTS, "true", RuleLevel.UNKNOWN, false)));

        EligibilityResult result = service.precheck("session", 1L);

        assertThat(result.status()).isEqualTo(EligibilityStatus.PUBLIC_CONDITIONS_MET);
        assertThat(result.unknownRules()).singleElement().satisfies(detail -> assertThat(detail.blocking()).isFalse());
    }

    @Test
    void conflictingCandidatesReturnInsufficientInformation() {
        RuleCandidate first = candidate("AGE", RuleOperator.GTE, "19", RuleLevel.HARD, true);
        RuleCandidate second = candidate("AGE", RuleOperator.GTE, "20", RuleLevel.HARD, true);
        first.requireReview();
        second.requireReview();
        when(candidateRepository.findByProductCodeOrderByCreatedAtDesc("DEMO"))
                .thenReturn(List.of(first, second));
        when(ruleRepository.findByProductIdAndActiveTrueOrderByRuleKeyAsc(1L)).thenReturn(List.of(
                rule("VISA_TYPE", RuleOperator.IN, "[\"F-5\"]", RuleLevel.HARD, true)));

        EligibilityResult result = service.precheck("session", 1L);

        assertThat(result.status()).isEqualTo(EligibilityStatus.INSUFFICIENT_INFORMATION);
        assertThat(result.insufficientReasons()).extracting(EligibilityResult.RuleDetail::messageCode)
                .contains("SOURCE_CONFLICT");
    }

    @Test
    void missingRequiredVisaRuleReturnsInsufficientInformation() {
        when(ruleRepository.findByProductIdAndActiveTrueOrderByRuleKeyAsc(1L)).thenReturn(List.of(
                rule("AGE", RuleOperator.GTE, "19", RuleLevel.HARD, true)));

        EligibilityResult result = service.precheck("session", 1L);

        assertThat(result.status()).isEqualTo(EligibilityStatus.INSUFFICIENT_INFORMATION);
        assertThat(result.insufficientReasons()).extracting(EligibilityResult.RuleDetail::messageCode)
                .contains("INSUFFICIENT_RULES");
    }

    @Test
    void nonEffectiveOfficialSourceReturnsInsufficientInformation() {
        source.review(ReviewStatus.NEED_REVIEW);
        when(ruleRepository.findByProductIdAndActiveTrueOrderByRuleKeyAsc(1L)).thenReturn(List.of(
                rule("VISA_TYPE", RuleOperator.IN, "[\"F-5\"]", RuleLevel.HARD, true)));

        EligibilityResult result = service.precheck("session", 1L);

        assertThat(result.status()).isEqualTo(EligibilityStatus.INSUFFICIENT_INFORMATION);
        assertThat(result.insufficientReasons()).extracting(EligibilityResult.RuleDetail::messageCode)
                .contains("SOURCE_NOT_EFFECTIVE");
    }

    private ProductRule rule(String key, RuleOperator operator, String value, RuleLevel level, boolean mandatory) {
        RuleCandidate candidate = candidate(key, operator, value, level, mandatory);
        candidate.approve();
        return new ProductRule(product, candidate);
    }

    private RuleCandidate candidate(String key, RuleOperator operator, String value,
                                    RuleLevel level, boolean mandatory) {
        return new RuleCandidate(source, "DEMO", key, operator, value, level, mandatory,
                "official condition", "p. 3", null, null, "Eligibility condition",
                new BigDecimal("0.9000"));
    }

    private static TempProfile profile(String language) {
        TempProfile profile = new TempProfile("session");
        LocalDate today = LocalDate.now();
        profile.update(new ProfileData("VN", today.minusYears(30), "F-5", today.plusYears(1),
                today.minusYears(2), "Developer", "REGULAR", new BigDecimal("3000000"), 24,
                "ACCOUNT", language, null, null, null, null));
        return profile;
    }

    private static SourceDocument approvedSource() {
        SourceDocument source = new SourceDocument("Bank", SourceType.PRODUCT_PAGE, "Official product",
                "https://www.kbstar.com/", "snapshot", "b".repeat(64), null, null);
        source.review(ReviewStatus.APPROVED);
        return source;
    }

    private static FinancialProduct product(SourceDocument source) {
        return new FinancialProduct("DEMO", "Bank", "Product", ProductType.CHECKING_ACCOUNT,
                FinancialPurpose.ACCOUNT, "description", "target", source, true, true, LocalDate.now(),
                "conditions", "additional", "documents", "application");
    }
}
