package com.visafy.rule;

/**
 * Describes what an official-source statement means. RuleLevel continues to
 * control runtime evaluation, while this value prevents documents, benefits,
 * and channel guidance from being mistaken for eligibility conditions.
 */
public enum RuleNature {
    HARD_ELIGIBILITY,
    REQUIRED_DOCUMENT,
    IDENTIFICATION_METHOD,
    CHANNEL_REQUIREMENT,
    BENEFIT_CONDITION,
    EXTERNAL_CHECK,
    UNKNOWN_ELIGIBILITY,
    INFORMATION;

    public static RuleNature defaultFor(RuleLevel level) {
        return switch (level) {
            case HARD -> HARD_ELIGIBILITY;
            case EXTERNAL_CHECK -> EXTERNAL_CHECK;
            case UNKNOWN -> UNKNOWN_ELIGIBILITY;
        };
    }

    public boolean affectsEligibility() {
        return this == HARD_ELIGIBILITY || this == EXTERNAL_CHECK || this == UNKNOWN_ELIGIBILITY;
    }
}
