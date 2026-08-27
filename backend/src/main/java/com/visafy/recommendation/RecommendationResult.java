package com.visafy.recommendation;

import com.visafy.eligibility.EligibilityResult;
import com.visafy.eligibility.EligibilityStatus;
import com.visafy.product.FinancialPurpose;
import com.visafy.product.ProductType;
import com.visafy.product.ProductAudience;
import com.visafy.product.ProductCategory;
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
            ProductAudience productAudience,
            ProductCategory productCategory,
            String targetSummary,
            String requiredDocuments,
            String applicationMethod,
            LocalDate informationBaseDate,
            EligibilityStatus eligibilityStatus,
            int confirmedPublicConditions,
            int totalPublicConditions,
            int additionalCheckCount,
            int unknownCount,
            boolean purposeMatched,
            int preferredConditionMatches,
            List<String> recommendationReasonCodes,
            String nextPreparationField,
            EligibilityResult eligibility
    ) {
    }
}
