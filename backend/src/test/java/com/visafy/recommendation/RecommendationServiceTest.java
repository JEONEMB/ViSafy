package com.visafy.recommendation;

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
import com.visafy.source.SourceType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {
    @Mock TempProfileService profileService;
    @Mock FinancialProductRepository productRepository;
    @Mock EligibilityService eligibilityService;

    private TempProfile profile;
    private RecommendationService service;

    @BeforeEach
    void setUp() {
        profile = profile();
        service = new RecommendationService(profileService, productRepository, eligibilityService);
        when(profileService.getBySessionId("session")).thenReturn(profile);
    }

    @Test
    void filtersGroupsAndSortsWithoutProbabilityScores() {
        FinancialProduct moreHard = product("More Hard", "Other Bank", FinancialPurpose.LOAN, "a");
        FinancialProduct preferred = product("Preferred", "KB Bank", FinancialPurpose.ACCOUNT, "b");
        FinancialProduct purpose = product("Purpose", "Other Bank", FinancialPurpose.ACCOUNT, "c");
        FinancialProduct moreUnknown = product("Unknown", "Other Bank", FinancialPurpose.ACCOUNT, "d");
        FinancialProduct insufficient = product("More Info", "Other Bank", FinancialPurpose.ACCOUNT, "e");
        FinancialProduct excluded = product("Excluded", "Other Bank", FinancialPurpose.ACCOUNT, "f");
        when(productRepository.findByActiveTrueOrderByCreatedAtDesc()).thenReturn(List.of(
                moreUnknown, excluded, purpose, insufficient, preferred, moreHard));
        when(eligibilityService.precheck(profile, moreHard)).thenReturn(result(EligibilityStatus.NEED_BANK_CONFIRMATION, 3, 3));
        when(eligibilityService.precheck(profile, preferred)).thenReturn(result(EligibilityStatus.PUBLIC_CONDITIONS_MET, 2, 0));
        when(eligibilityService.precheck(profile, purpose)).thenReturn(result(EligibilityStatus.PUBLIC_CONDITIONS_MET, 2, 0));
        when(eligibilityService.precheck(profile, moreUnknown)).thenReturn(result(EligibilityStatus.NEED_BANK_CONFIRMATION, 2, 1));
        when(eligibilityService.precheck(profile, insufficient)).thenReturn(result(EligibilityStatus.INSUFFICIENT_INFORMATION, 1, 0));
        when(eligibilityService.precheck(profile, excluded)).thenReturn(result(EligibilityStatus.PUBLIC_CONDITIONS_NOT_MET, 4, 0));

        RecommendationResult result = service.recommend("session");

        assertThat(result.recommended()).extracting(RecommendationResult.RecommendationItem::productName)
                .containsExactly("More Hard", "Preferred", "Purpose", "Unknown");
        assertThat(result.additionalInformationNeeded()).extracting(RecommendationResult.RecommendationItem::productName)
                .containsExactly("More Info");
        assertThat(result.excludedCount()).isEqualTo(1);
        assertThat(result.recommended().get(1).preferredConditionMatches()).isEqualTo(1);
    }

    private EligibilityResult result(EligibilityStatus status, int passedCount, int unknownCount) {
        List<RuleDetail> passed = java.util.stream.IntStream.range(0, passedCount)
                .mapToObj(index -> detail("PASS_" + index)).toList();
        List<RuleDetail> failed = status == EligibilityStatus.PUBLIC_CONDITIONS_NOT_MET
                ? List.of(detail("FAIL")) : List.of();
        List<RuleDetail> unknown = java.util.stream.IntStream.range(0, unknownCount)
                .mapToObj(index -> detail("UNKNOWN_" + index)).toList();
        List<RuleDetail> insufficient = status == EligibilityStatus.INSUFFICIENT_INFORMATION
                ? List.of(detail("MISSING")) : List.of();
        return new EligibilityResult(status, null, passed, failed, List.of(), unknown, insufficient,
                "Not final approval");
    }

    private RuleDetail detail(String key) {
        return new RuleDetail(null, key, key, key, null, null, true, false,
                null, null, null);
    }

    private static TempProfile profile() {
        TempProfile profile = new TempProfile("session");
        LocalDate today = LocalDate.now();
        profile.update(new ProfileData("VN", today.minusYears(30), "F-5", today.plusYears(1),
                today.minusYears(2), "Developer", "REGULAR", new BigDecimal("3000000"), 24,
                "ACCOUNT", "ko", true, "RENT", null, "KB"));
        return profile;
    }

    private static FinancialProduct product(String name, String institution, FinancialPurpose purpose, String hashSeed) {
        SourceDocument source = new SourceDocument(institution, SourceType.PRODUCT_PAGE, name,
                "https://www.kbstar.com/", "snapshot", hashSeed.repeat(64), null, null);
        source.review(ReviewStatus.APPROVED);
        return new FinancialProduct(name.toUpperCase().replace(' ', '_'), institution, name,
                ProductType.CHECKING_ACCOUNT, purpose, "description", "target", source, true, true,
                LocalDate.now(), "conditions", "additional", "documents", "application");
    }
}
