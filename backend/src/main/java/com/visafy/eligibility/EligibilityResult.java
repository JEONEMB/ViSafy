package com.visafy.eligibility;

import java.util.List;

public record EligibilityResult(
        EligibilityStatus status,
        Long productId,
        List<RuleDetail> passedRules,
        List<RuleDetail> failedRules,
        List<RuleDetail> externalChecks,
        List<RuleDetail> unknownRules,
        List<RuleDetail> insufficientReasons,
        String disclaimer
) {
    public record RuleDetail(
            Long ruleId,
            String key,
            String messageCode,
            String message,
            String actualValue,
            String expectedValue,
            boolean mandatory,
            boolean blocking,
            String sourceExcerpt,
            String sourceLocator,
            String sourceUrl
    ) {
    }
}
