package com.visafy.recommendation;

import com.visafy.eligibility.EligibilityResult;
import com.visafy.eligibility.EligibilityService;
import com.visafy.product.FinancialProduct;
import com.visafy.product.FinancialProductRepository;
import com.visafy.profile.TempProfile;
import com.visafy.profile.TempProfileService;
import com.visafy.recommendation.RecommendationResult.RecommendationItem;
import com.visafy.journey.FinancialPurposeCode;
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
                .equalsIgnoreCase(FinancialPurposeCode.from(profile.getFinancialPurpose()).productPurpose());
        int preferredMatches = preferredBankMatches(profile, product) ? 1 : 0;
        List<String> reasons = new ArrayList<>();
        if (purposeMatched) reasons.add("FINANCIAL_PURPOSE_MATCH");
        if (passed > 0) reasons.add("PUBLIC_CONDITIONS_CONFIRMED");
        if (eligibility.failedRules().isEmpty()) reasons.add("NO_EXPLICIT_FAILURE");
        if (eligibility.unknownRules().isEmpty()) reasons.add("NO_UNKNOWN_CONDITION");
        String nextField = eligibility.requiredFields().stream()
                .filter(field -> profileValueMissing(profile, field)).findFirst().orElse(null);
        return new RecommendationItem(product.getId(), product.getProductCode(), product.getInstitution(),
                product.getProductName(),
                product.getProductType(), product.getFinancialPurpose(), product.getProductAudience(),
                product.getProductCategory(), product.getTargetSummary(), product.getRequiredDocuments(),
                product.getApplicationMethod(),
                product.getInformationBaseDate(), eligibility.status(), passed, totalHard, additionalChecks,
                eligibility.unknownRules().size(), purposeMatched, preferredMatches, List.copyOf(reasons), nextField, eligibility);
    }

    private boolean profileValueMissing(TempProfile profile, String field) {
        return switch (field) {
            case "birthDate" -> profile.getBirthDate() == null;
            case "visaType" -> profile.getVisaType() == null;
            case "visaExpiry" -> profile.getVisaExpiry() == null;
            case "residencyStartDate" -> profile.getResidencyStartDate() == null;
            case "residentStatus" -> profile.getResidentStatus() == null;
            case "occupation" -> profile.getOccupation() == null;
            case "employmentType" -> profile.getEmploymentType() == null;
            case "monthlyIncome" -> profile.getMonthlyIncome() == null;
            case "employmentDurationMonths" -> profile.getEmploymentDurationMonths() == null;
            case "hasExistingProductAccount" -> profile.getHasExistingProductAccount() == null;
            case "desiredMonthlyAmount" -> profile.getDesiredMonthlyAmount() == null;
            case "hasResidenceCard" -> profile.getHasResidenceCard() == null;
            case "hasPassport" -> profile.getHasPassport() == null;
            case "hasDomesticPhone" -> profile.getHasDomesticPhone() == null;
            case "canDomesticPhoneVerify" -> profile.getCanDomesticPhoneVerify() == null;
            case "hasKoreanBankAccount" -> profile.getHasKoreanBankAccount() == null;
            case "hasKoreanCreditHistory" -> profile.getHasKoreanCreditHistory() == null;
            case "preferredChannel" -> profile.getPreferredChannel() == null;
            case "remittanceCountry" -> profile.getRemittanceCountry() == null;
            case "desiredAmount" -> profile.getDesiredAmount() == null;
            default -> false;
        };
    }

    private boolean preferredBankMatches(TempProfile profile, FinancialProduct product) {
        String preferredBank = profile.getPreferredBank();
        return preferredBank != null && !preferredBank.isBlank()
                && product.getInstitution().toLowerCase(Locale.ROOT)
                .contains(preferredBank.strip().toLowerCase(Locale.ROOT));
    }
}
