package com.visafy.journey;

import java.util.List;

public record FinancialJourneyResult(
        FinancialPurposeCode purpose,
        int currentStep,
        String headline,
        String nextAction,
        ProfileSummary profile,
        List<JourneyStep> steps
) {
    public record ProfileSummary(
            String nationality,
            boolean hasResidenceCard,
            boolean hasPassport,
            boolean hasDomesticPhone,
            boolean canDomesticPhoneVerify,
            boolean hasKoreanBankAccount,
            boolean hasKoreanCreditHistory,
            String remittanceCountry
    ) {}
    public record JourneyStep(int step, String code, JourneyStepStatus status, String title, String description) {}
    public enum JourneyStepStatus { COMPLETED, CURRENT, UPCOMING, NEED_CONFIRMATION }
}
