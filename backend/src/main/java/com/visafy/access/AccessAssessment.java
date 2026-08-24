package com.visafy.access;

import java.util.List;

public record AccessAssessment(
        AccessStatus status,
        AccessAvailability identification,
        AccessAvailability branch,
        AccessAvailability online,
        List<AccessDetail> details,
        boolean realNameGuardrailApplied
) {
    public static AccessAssessment unknown() {
        return new AccessAssessment(AccessStatus.ACCESS_UNKNOWN, AccessAvailability.UNKNOWN,
                AccessAvailability.UNKNOWN, AccessAvailability.UNKNOWN, List.of(), false);
    }

    public enum AccessAvailability { AVAILABLE, NEED_CONFIRMATION, NOT_AVAILABLE, UNKNOWN }

    public record AccessDetail(
            String category,
            String key,
            String messageCode,
            String message,
            String sourceExcerpt,
            String sourceLocator,
            String sourceUrl
    ) {}
}
