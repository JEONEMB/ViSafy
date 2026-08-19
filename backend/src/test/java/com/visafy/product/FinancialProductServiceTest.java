package com.visafy.product;

import static org.assertj.core.api.Assertions.assertThat;

import com.visafy.common.domain.ReviewStatus;
import com.visafy.rule.RuleCandidate;
import com.visafy.rule.RuleLevel;
import com.visafy.source.SourceDocument;
import com.visafy.source.SourceType;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

class FinancialProductServiceTest {
    private final SourceDocument source = approvedSource();

    @Test
    void noApprovedRulesIsNotReady() {
        assertThat(FinancialProductService.diagnose(List.of())).isEqualTo(DiagnosisStatus.NOT_READY);
    }

    @Test
    void hardVisaRuleWithoutUncertainRulesIsReady() {
        assertThat(FinancialProductService.diagnose(List.of(rule("VISA_TYPE", RuleLevel.HARD))))
                .isEqualTo(DiagnosisStatus.READY);
    }

    @Test
    void unknownOrExternalRuleMakesProductPartial() {
        assertThat(FinancialProductService.diagnose(List.of(
                rule("VISA_TYPE", RuleLevel.HARD), rule("BANK_CONFIRMATION", RuleLevel.EXTERNAL_CHECK))))
                .isEqualTo(DiagnosisStatus.PARTIAL);
    }

    private ProductRule rule(String key, RuleLevel level) {
        RuleCandidate candidate = new RuleCandidate(source, "DEMO", key, "IN", "[]", level,
                "official excerpt", new BigDecimal("0.9000"));
        candidate.approve();
        return new ProductRule(candidate);
    }

    private static SourceDocument approvedSource() {
        SourceDocument source = new SourceDocument("은행", SourceType.PRODUCT_PAGE, "공식 상품",
                "https://www.kbstar.com/", "snapshot", "b".repeat(64), null, null);
        source.review(ReviewStatus.APPROVED);
        return source;
    }
}
