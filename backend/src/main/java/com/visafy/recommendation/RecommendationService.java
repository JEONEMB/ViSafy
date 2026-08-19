package com.visafy.recommendation;

import com.visafy.eligibility.EligibilityResult;
import com.visafy.eligibility.EligibilityService;
import com.visafy.product.FinancialProduct;
import com.visafy.product.FinancialProductRepository;
import com.visafy.profile.TempProfile;
import com.visafy.profile.TempProfileService;
import com.visafy.recommendation.RecommendationResult.RecommendationItem;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;

@Service
public class RecommendationService {
    private final TempProfileService profileService;
    private final FinancialProductRepository productRepository;
    private final EligibilityService eligibilityService;

    public RecommendationService(TempProfileService profileService, FinancialProductRepository productRepository,
                                 EligibilityService eligibilityService) {
        this.profileService = profileService;
        this.productRepository = productRepository;
        this.eligibilityService = eligibilityService;
    }

    public RecommendationResult recommend(String profileSessionId) {
        TempProfile profile = profileService.getBySessionId(profileSessionId.strip());
        List<RecommendationItem> recommended = new ArrayList<>();
        List<RecommendationItem> additionalInformationNeeded = new ArrayList<>();
        int excluded = 0;

        for (FinancialProduct product : productRepository.findByActiveTrueOrderByCreatedAtDesc()) {
            EligibilityResult eligibility = eligibilityService.precheck(profile, product);
            RecommendationItem item = toItem(profile, product, eligibility);
            switch (eligibility.status()) {
                case PUBLIC_CONDITIONS_MET, NEED_BANK_CONFIRMATION -> recommended.add(item);
                case INSUFFICIENT_INFORMATION -> additionalInformationNeeded.add(item);
                case PUBLIC_CONDITIONS_NOT_MET -> excluded++;
            }
        }

        Comparator<RecommendationItem> order = Comparator
                .comparingInt(RecommendationItem::confirmedPublicConditions).reversed()
                .thenComparingInt(RecommendationItem::unknownCount)
                .thenComparing(RecommendationItem::purposeMatched, Comparator.reverseOrder())
                .thenComparing(Comparator.comparingInt(RecommendationItem::preferredConditionMatches).reversed())
                .thenComparing(RecommendationItem::institution, String.CASE_INSENSITIVE_ORDER)
                .thenComparing(RecommendationItem::productName, String.CASE_INSENSITIVE_ORDER);
        recommended.sort(order);
        additionalInformationNeeded.sort(order);
        return new RecommendationResult(List.copyOf(recommended),
                List.copyOf(additionalInformationNeeded), excluded);
    }

    private RecommendationItem toItem(TempProfile profile, FinancialProduct product,
                                      EligibilityResult eligibility) {
        int passed = eligibility.passedRules().size();
        int totalHard = passed + eligibility.failedRules().size();
        int additionalChecks = eligibility.externalChecks().size() + eligibility.unknownRules().size();
        boolean purposeMatched = product.getFinancialPurpose().name()
                .equalsIgnoreCase(profile.getFinancialPurpose());
        int preferredMatches = preferredBankMatches(profile, product) ? 1 : 0;
        return new RecommendationItem(product.getId(), product.getInstitution(), product.getProductName(),
                product.getProductType(), product.getFinancialPurpose(), product.getTargetSummary(),
                product.getInformationBaseDate(), eligibility.status(), passed, totalHard, additionalChecks,
                eligibility.unknownRules().size(), purposeMatched, preferredMatches, eligibility);
    }

    private boolean preferredBankMatches(TempProfile profile, FinancialProduct product) {
        String preferredBank = profile.getPreferredBank();
        return preferredBank != null && !preferredBank.isBlank()
                && product.getInstitution().toLowerCase(Locale.ROOT)
                .contains(preferredBank.strip().toLowerCase(Locale.ROOT));
    }
}
