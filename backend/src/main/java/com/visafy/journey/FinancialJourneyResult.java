package com.visafy.journey;

import java.util.List;

public record FinancialJourneyResult(
        FinancialPurposeCode purpose,
        int currentStep,
        String headline,
        String nextAction,
        List<JourneyStep> steps
) {
    public record JourneyStep(int step, String code, JourneyStepStatus status, String title, String description) {}
    public enum JourneyStepStatus { COMPLETED, CURRENT, UPCOMING, NEED_CONFIRMATION }
}
