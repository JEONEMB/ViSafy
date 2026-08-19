package com.visafy.recommendation;

import com.visafy.eligibility.EligibilityResult;
import com.visafy.eligibility.EligibilityStatus;
import com.visafy.product.FinancialPurpose;
import com.visafy.product.ProductType;
import java.time.LocalDate;
import java.util.List;

public record RecommendationResult(
        List<RecommendationItem> recommended,
        List<RecommendationItem> additionalInformationNeeded,
        int excludedCount
) {
    public record RecommendationItem(
            Long productId,
            String institution,
            String productName,
            ProductType productType,
            FinancialPurpose financialPurpose,
            String targetSummary,
            LocalDate informationBaseDate,
            EligibilityStatus eligibilityStatus,
            int confirmedPublicConditions,
            int totalPublicConditions,
            int additionalCheckCount,
            int unknownCount,
            boolean purposeMatched,
            int preferredConditionMatches,
            EligibilityResult eligibility
    ) {
    }
}
