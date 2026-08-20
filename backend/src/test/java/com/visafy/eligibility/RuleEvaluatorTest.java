package com.visafy.eligibility;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visafy.common.domain.ReviewStatus;
import com.visafy.product.FinancialProduct;
import com.visafy.product.FinancialPurpose;
import com.visafy.product.ProductRule;
import com.visafy.product.ProductType;
import com.visafy.profile.TempProfile;
import com.visafy.profile.TempProfile.ProfileData;
import com.visafy.rule.RuleCandidate;
import com.visafy.rule.RuleLevel;
import com.visafy.rule.RuleOperator;
import com.visafy.source.SourceDocument;
import com.visafy.source.SourceType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class RuleEvaluatorTest {
    private static final LocalDate TODAY = LocalDate.of(2026, 8, 19);
    private final SourceDocument source = approvedSource();
    private final FinancialProduct product = product(source);
    private final TempProfile profile = profile(TODAY);
    private final RuleEvaluator evaluator = new RuleEvaluator(new ObjectMapper());

    @ParameterizedTest
    @MethodSource("operatorCases")
    void evaluatesEveryComparisonOperator(RuleOperator operator, String value,
                                          RuleEvaluator.EvaluationKind expected) {
        assertThat(evaluator.evaluate(rule("AGE", operator, value, true), profile, TODAY).kind())
                .isEqualTo(expected);
    }

    static Stream<Arguments> operatorCases() {
        return Stream.of(
                Arguments.of(RuleOperator.EQ, "30", RuleEvaluator.EvaluationKind.PASS),
                Arguments.of(RuleOperator.EQ, "31", RuleEvaluator.EvaluationKind.FAIL),
                Arguments.of(RuleOperator.NE, "31", RuleEvaluator.EvaluationKind.PASS),
                Arguments.of(RuleOperator.NE, "30", RuleEvaluator.EvaluationKind.FAIL),
                Arguments.of(RuleOperator.GT, "29", RuleEvaluator.EvaluationKind.PASS),
                Arguments.of(RuleOperator.GT, "30", RuleEvaluator.EvaluationKind.FAIL),
                Arguments.of(RuleOperator.GTE, "30", RuleEvaluator.EvaluationKind.PASS),
                Arguments.of(RuleOperator.GTE, "31", RuleEvaluator.EvaluationKind.FAIL),
                Arguments.of(RuleOperator.LT, "31", RuleEvaluator.EvaluationKind.PASS),
                Arguments.of(RuleOperator.LT, "30", RuleEvaluator.EvaluationKind.FAIL),
                Arguments.of(RuleOperator.LTE, "30", RuleEvaluator.EvaluationKind.PASS),
                Arguments.of(RuleOperator.LTE, "29", RuleEvaluator.EvaluationKind.FAIL),
                Arguments.of(RuleOperator.IN, "[29,30]", RuleEvaluator.EvaluationKind.PASS),
                Arguments.of(RuleOperator.IN, "[31,32]", RuleEvaluator.EvaluationKind.FAIL),
                Arguments.of(RuleOperator.NOT_IN, "[31,32]", RuleEvaluator.EvaluationKind.PASS),
                Arguments.of(RuleOperator.NOT_IN, "[29,30]", RuleEvaluator.EvaluationKind.FAIL),
                Arguments.of(RuleOperator.EXISTS, "true", RuleEvaluator.EvaluationKind.PASS)
        );
    }

    @Test
    void usesFullYearsAndFullMonthsAtCalendarBoundaries() {
        assertThat(evaluator.evaluate(rule("AGE", RuleOperator.EQ, "30", true), profile, TODAY).kind())
                .isEqualTo(RuleEvaluator.EvaluationKind.PASS);
        assertThat(evaluator.evaluate(rule("VISA_REMAINING_MONTH", RuleOperator.EQ, "2", true), profile, TODAY)
                .kind()).isEqualTo(RuleEvaluator.EvaluationKind.PASS);
        assertThat(evaluator.evaluate(rule("RESIDENCY_MONTH", RuleOperator.EQ, "14", true), profile, TODAY)
                .kind()).isEqualTo(RuleEvaluator.EvaluationKind.PASS);
    }

    @Test
    void invalidJsonArrayReturnsInvalidInsteadOfThrowing() {
        assertThat(evaluator.evaluate(rule("VISA_TYPE", RuleOperator.IN, "F-2,F-5", true), profile, TODAY).kind())
                .isEqualTo(RuleEvaluator.EvaluationKind.INVALID);
    }

    @Test
    void missingOptionalInputIsReportedAsMissing() {
        assertThat(evaluator.evaluate(rule("PREFERRED_BANK", RuleOperator.EXISTS, "true", false), profile, TODAY)
                .kind()).isEqualTo(RuleEvaluator.EvaluationKind.MISSING);
    }

    @Test
    void test101VisaRulePassesForAllowedD2AndFailsForF5Only() {
        TempProfile d2Profile = profile(TODAY, "D-2", TODAY.plusYears(1));

        assertThat(evaluator.evaluate(
                rule("VISA_TYPE", RuleOperator.IN, "[\"D-2\"]", true), d2Profile, TODAY).kind())
                .isEqualTo(RuleEvaluator.EvaluationKind.PASS);
        assertThat(evaluator.evaluate(
                rule("VISA_TYPE", RuleOperator.IN, "[\"F-5\"]", true), d2Profile, TODAY).kind())
                .isEqualTo(RuleEvaluator.EvaluationKind.FAIL);
    }

    @Test
    void test102VisaRemainingMonthUsesCompletelyElapsedCalendarMonths() {
        // 기준일 2026-08-19에서 2026-11-18은 2개월 30일이므로 완전히 경과한 달은 2개월이다.
        TempProfile twoMonthsThirtyDays = profile(TODAY, "D-2", TODAY.plusMonths(3).minusDays(1));
        // 같은 일자인 2026-11-19에 도달해야 완전히 경과한 3개월로 계산한다.
        TempProfile exactlyThreeMonths = profile(TODAY, "D-2", TODAY.plusMonths(3));
        ProductRule minimumThreeMonths = rule(
                "VISA_REMAINING_MONTH", RuleOperator.GTE, "3", true);

        assertThat(evaluator.evaluate(minimumThreeMonths, twoMonthsThirtyDays, TODAY).kind())
                .isEqualTo(RuleEvaluator.EvaluationKind.FAIL);
        assertThat(evaluator.evaluate(minimumThreeMonths, exactlyThreeMonths, TODAY).kind())
                .isEqualTo(RuleEvaluator.EvaluationKind.PASS);
    }

    private ProductRule rule(String key, RuleOperator operator, String value, boolean mandatory) {
        RuleCandidate candidate = new RuleCandidate(source, "DEMO", key, operator, value, RuleLevel.HARD,
                mandatory, "official excerpt", "p. 3", null, null, "condition", new BigDecimal("0.9000"));
        candidate.approve();
        return new ProductRule(product, candidate);
    }

    private static TempProfile profile(LocalDate today) {
        return profile(today, "F-5", today.plusMonths(3).minusDays(1));
    }

    private static TempProfile profile(LocalDate today, String visaType, LocalDate visaExpiry) {
        TempProfile profile = new TempProfile("session");
        profile.update(new ProfileData("VN", today.minusYears(30), visaType, visaExpiry,
                today.minusMonths(15).plusDays(1), "Developer", "REGULAR", new BigDecimal("3000000"),
                24, "ACCOUNT", "ko", null, null, null, null));
        return profile;
    }

    private static SourceDocument approvedSource() {
        SourceDocument source = new SourceDocument("Bank", SourceType.PRODUCT_PAGE, "Official product",
                "https://www.kbstar.com/", "snapshot", "a".repeat(64), null, null, "ko");
        source.review(ReviewStatus.APPROVED);
        return source;
    }

    private static FinancialProduct product(SourceDocument source) {
        return new FinancialProduct("DEMO", "Bank", "Product", ProductType.CHECKING_ACCOUNT,
                FinancialPurpose.ACCOUNT, "description", "target", source, true, true, TODAY,
                "conditions", "additional", "documents", "application");
    }
}
