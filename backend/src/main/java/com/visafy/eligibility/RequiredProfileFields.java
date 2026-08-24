package com.visafy.eligibility;

import com.visafy.product.ProductRule;
import com.visafy.rule.RuleLevel;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public final class RequiredProfileFields {
    private static final Map<String, String> FIELD_BY_RULE = Map.ofEntries(
            Map.entry("AGE", "birthDate"),
            Map.entry("VISA_TYPE", "visaType"),
            Map.entry("VISA_REMAINING_MONTH", "visaExpiry"),
            Map.entry("RESIDENCY_MONTH", "residencyStartDate"),
            Map.entry("RESIDENCE_MONTHS", "residencyStartDate"),
            Map.entry("DOMESTIC_INCOME_MONTH", "employmentDurationMonths"),
            Map.entry("EMPLOYMENT_DURATION_MONTHS", "employmentDurationMonths"),
            Map.entry("EMPLOYMENT_MONTHS", "employmentDurationMonths"),
            Map.entry("MONTHLY_INCOME", "monthlyIncome"),
            Map.entry("NATIONALITY", "nationality"),
            Map.entry("OCCUPATION", "occupation"),
            Map.entry("EMPLOYMENT_TYPE", "employmentType"),
            Map.entry("FINANCIAL_PURPOSE", "financialPurpose"),
            Map.entry("HAS_BANK_ACCOUNT", "hasBankAccount"),
            Map.entry("HOUSING_TYPE", "housingType"),
            Map.entry("DESIRED_AMOUNT", "desiredAmount"),
            Map.entry("PREFERRED_BANK", "preferredBank"),
            Map.entry("IS_FOREIGNER", "nationality"),
            Map.entry("RESIDENT_STATUS", "residentStatus"),
            Map.entry("HAS_EXISTING_PRODUCT_ACCOUNT", "hasExistingProductAccount"),
            Map.entry("DESIRED_MONTHLY_AMOUNT", "desiredMonthlyAmount")
            ,Map.entry("HAS_RESIDENCE_CARD", "hasResidenceCard")
            ,Map.entry("HAS_PASSPORT", "hasPassport")
            ,Map.entry("HAS_DOMESTIC_PHONE", "hasDomesticPhone")
            ,Map.entry("CAN_DOMESTIC_PHONE_VERIFY", "canDomesticPhoneVerify")
            ,Map.entry("HAS_KOREAN_BANK_ACCOUNT", "hasKoreanBankAccount")
            ,Map.entry("HAS_KOREAN_CREDIT_HISTORY", "hasKoreanCreditHistory")
            ,Map.entry("PREFERRED_CHANNEL", "preferredChannel")
            ,Map.entry("REMITTANCE_COUNTRY", "remittanceCountry")
    );

    private RequiredProfileFields() {
    }

    public static List<String> from(List<ProductRule> rules) {
        LinkedHashSet<String> fields = new LinkedHashSet<>();
        rules.stream()
                .filter(rule -> rule.getRuleLevel() == RuleLevel.HARD)
                .filter(rule -> rule.getRuleNature().affectsEligibility())
                .map(ProductRule::getRuleKey)
                .map(key -> FIELD_BY_RULE.get(key.toUpperCase(Locale.ROOT)))
                .filter(java.util.Objects::nonNull)
                .forEach(fields::add);
        return List.copyOf(fields);
    }
}
