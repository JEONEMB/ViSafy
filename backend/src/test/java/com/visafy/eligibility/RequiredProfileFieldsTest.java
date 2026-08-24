package com.visafy.eligibility;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.visafy.product.ProductRule;
import com.visafy.rule.RuleLevel;
import com.visafy.rule.RuleNature;
import java.util.List;
import org.junit.jupiter.api.Test;

class RequiredProfileFieldsTest {
    @Test
    void generalProductWithoutVisaRuleDoesNotAskVisaQuestions() {
        ProductRule nationality = rule("NATIONALITY", RuleNature.HARD_ELIGIBILITY);
        ProductRule identity = rule("HAS_RESIDENCE_CARD", RuleNature.IDENTIFICATION_METHOD);

        List<String> fields = RequiredProfileFields.from(List.of(nationality, identity));

        assertThat(fields).containsExactly("nationality");
        assertThat(fields).doesNotContain("visaType", "visaExpiry");
    }

    @Test
    void foreignerLoanAsksVisaOnlyWhenApprovedHardRulesRequireIt() {
        List<String> fields = RequiredProfileFields.from(List.of(
                rule("VISA_TYPE", RuleNature.HARD_ELIGIBILITY),
                rule("VISA_REMAINING_MONTH", RuleNature.HARD_ELIGIBILITY),
                rule("EMPLOYMENT_DURATION_MONTHS", RuleNature.HARD_ELIGIBILITY),
                rule("MONTHLY_INCOME", RuleNature.HARD_ELIGIBILITY)));

        assertThat(fields).containsExactly("visaType", "visaExpiry",
                "employmentDurationMonths", "monthlyIncome");
    }

    private ProductRule rule(String key, RuleNature nature) {
        ProductRule rule = mock(ProductRule.class);
        when(rule.getRuleKey()).thenReturn(key);
        when(rule.getRuleLevel()).thenReturn(RuleLevel.HARD);
        when(rule.getRuleNature()).thenReturn(nature);
        return rule;
    }
}
