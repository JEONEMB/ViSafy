package com.visafy.product;

import java.util.List;

public record Season3DataPackage(
        boolean productPage,
        boolean termsOrDescription,
        boolean hardRuleEvidence,
        boolean identityEvidence,
        boolean channelEvidence,
        boolean documentEvidence,
        boolean applicationStepEvidence,
        boolean informationBaseDate,
        List<String> missingItems
) {
    public boolean complete() { return missingItems.isEmpty(); }

    public boolean isComplete() { return complete(); }
}
