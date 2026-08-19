package com.visafy.eligibility;

import com.visafy.profile.TempProfile;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

final class ProfileRuleValueResolver {
    private ProfileRuleValueResolver() {
    }

    static ResolvedValue resolve(String ruleKey, TempProfile profile, LocalDate today) {
        return switch (ruleKey.toUpperCase(Locale.ROOT)) {
            case "AGE" -> number(Period.between(profile.getBirthDate(), today).getYears());
            case "VISA_TYPE" -> string(profile.getVisaType());
            case "VISA_REMAINING_MONTH" -> number(Math.max(0,
                    ChronoUnit.MONTHS.between(today, profile.getVisaExpiry())));
            case "RESIDENCY_MONTH" -> number(Math.max(0,
                    ChronoUnit.MONTHS.between(profile.getResidencyStartDate(), today)));
            case "DOMESTIC_INCOME_MONTH", "EMPLOYMENT_DURATION_MONTHS" ->
                    number(profile.getEmploymentDurationMonths());
            case "MONTHLY_INCOME" -> number(profile.getMonthlyIncome());
            case "NATIONALITY" -> string(profile.getNationality());
            case "OCCUPATION" -> string(profile.getOccupation());
            case "EMPLOYMENT_TYPE" -> string(profile.getEmploymentType());
            case "FINANCIAL_PURPOSE" -> string(profile.getFinancialPurpose());
            case "HAS_BANK_ACCOUNT" -> bool(profile.getHasBankAccount());
            case "HOUSING_TYPE" -> string(profile.getHousingType());
            case "DESIRED_AMOUNT" -> number(profile.getDesiredAmount());
            case "PREFERRED_BANK" -> string(profile.getPreferredBank());
            default -> ResolvedValue.unsupported();
        };
    }

    private static ResolvedValue string(String value) {
        return new ResolvedValue(true, value == null || value.isBlank(), ValueType.STRING, value);
    }

    private static ResolvedValue number(Number value) {
        return new ResolvedValue(true, value == null, ValueType.NUMBER,
                value == null ? null : new BigDecimal(value.toString()));
    }

    private static ResolvedValue bool(Boolean value) {
        return new ResolvedValue(true, value == null, ValueType.BOOLEAN, value);
    }

    enum ValueType { STRING, NUMBER, BOOLEAN }

    record ResolvedValue(boolean supported, boolean missing, ValueType type, Object value) {
        static ResolvedValue unsupported() {
            return new ResolvedValue(false, true, null, null);
        }

        String displayValue() {
            if (value == null) return null;
            if (value instanceof BigDecimal decimal) return decimal.stripTrailingZeros().toPlainString();
            return value.toString();
        }
    }
}
