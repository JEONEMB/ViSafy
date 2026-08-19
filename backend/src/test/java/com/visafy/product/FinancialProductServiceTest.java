package com.visafy.product;

import static org.assertj.core.api.Assertions.assertThat;

import com.visafy.common.domain.ReviewStatus;
import com.visafy.rule.RuleCandidate;
import com.visafy.rule.RuleLevel;
import com.visafy.source.SourceDocument;
import com.visafy.source.SourceType;
import java.math.BigDecimal;
import java.util.List;
import java.time.LocalDate;
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

    @Test
    void optionalExternalRuleDoesNotDowngradeReadyProduct() {
        assertThat(FinancialProductService.diagnose(List.of(
                rule("VISA_TYPE", RuleLevel.HARD), rule("OPTIONAL_CHECK", RuleLevel.EXTERNAL_CHECK, false))))
                .isEqualTo(DiagnosisStatus.READY);
    }

    private ProductRule rule(String key, RuleLevel level) {
        return rule(key, level, true);
    }

    private ProductRule rule(String key, RuleLevel level, boolean mandatory) {
        RuleCandidate candidate = new RuleCandidate(source, "DEMO", key, com.visafy.rule.RuleOperator.IN,
                "[]", level, mandatory, "official excerpt", "p. 3", null, null,
                "Eligibility condition", new BigDecimal("0.9000"));
        candidate.approve();
        return new ProductRule(product(), candidate);
    }

    private FinancialProduct product() {
        return new FinancialProduct("DEMO", "은행", "상품", ProductType.CHECKING_ACCOUNT,
                FinancialPurpose.ACCOUNT, "설명", "대상", source, true, true, LocalDate.now(),
                "공개조건", "추가조건", "필요서류", "신청방법");
    }

    private static SourceDocument approvedSource() {
        SourceDocument source = new SourceDocument("은행", SourceType.PRODUCT_PAGE, "공식 상품",
                "https://www.kbstar.com/", "snapshot", "b".repeat(64), null, null, "ko");
        source.review(ReviewStatus.APPROVED);
        return source;
    }
}
