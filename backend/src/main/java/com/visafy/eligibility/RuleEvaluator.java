package com.visafy.eligibility;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.visafy.product.ProductRule;
import com.visafy.profile.TempProfile;
import com.visafy.rule.RuleOperator;
import java.math.BigDecimal;
import java.time.LocalDate;

final class RuleEvaluator {
    private final ObjectMapper objectMapper;

    RuleEvaluator(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    Evaluation evaluate(ProductRule rule, TempProfile profile, LocalDate today) {
        var resolved = ProfileRuleValueResolver.resolve(rule.getRuleKey(), profile, today);
        if (!resolved.supported()) return Evaluation.unsupported();
        if (resolved.missing()) return Evaluation.missing();
        try {
            boolean passed = switch (rule.getOperator()) {
                case EXISTS -> true;
                case EQ -> compare(resolved, scalar(rule.getRuleValue(), resolved.type())) == 0;
                case NE -> compare(resolved, scalar(rule.getRuleValue(), resolved.type())) != 0;
                case GT -> orderedCompare(resolved, scalar(rule.getRuleValue(), resolved.type())) > 0;
                case GTE -> orderedCompare(resolved, scalar(rule.getRuleValue(), resolved.type())) >= 0;
                case LT -> orderedCompare(resolved, scalar(rule.getRuleValue(), resolved.type())) < 0;
                case LTE -> orderedCompare(resolved, scalar(rule.getRuleValue(), resolved.type())) <= 0;
                case IN -> contains(rule.getRuleValue(), resolved);
                case NOT_IN -> !contains(rule.getRuleValue(), resolved);
            };
            return new Evaluation(passed ? EvaluationKind.PASS : EvaluationKind.FAIL,
                    resolved.displayValue());
        } catch (IllegalArgumentException exception) {
            return Evaluation.invalid(resolved.displayValue());
        }
    }

    private Object scalar(String raw, ProfileRuleValueResolver.ValueType type) {
        String value = raw.strip();
        try {
            JsonNode node = objectMapper.readTree(value);
            if (node != null && node.isValueNode()) value = node.asText();
        } catch (Exception ignored) {
            // Plain scalar values are valid for EQ and ordered comparisons.
        }
        return convert(value, type);
    }

    private boolean contains(String raw, ProfileRuleValueResolver.ResolvedValue actual) {
        try {
            JsonNode values = objectMapper.readTree(raw);
            if (values == null || !values.isArray() || values.isEmpty()) {
                throw new IllegalArgumentException("IN value must be a non-empty JSON array");
            }
            for (JsonNode value : values) {
                if (compare(actual, convert(value.asText(), actual.type())) == 0) return true;
            }
            return false;
        } catch (IllegalArgumentException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new IllegalArgumentException("IN value must be valid JSON", exception);
        }
    }

    private Object convert(String value, ProfileRuleValueResolver.ValueType type) {
        try {
            return switch (type) {
                case STRING -> value.strip();
                case NUMBER -> new BigDecimal(value.strip());
                case BOOLEAN -> {
                    if (!"true".equalsIgnoreCase(value) && !"false".equalsIgnoreCase(value)) {
                        throw new IllegalArgumentException("Boolean value must be true or false");
                    }
                    yield Boolean.valueOf(value);
                }
            };
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("Numeric rule value is invalid", exception);
        }
    }

    private int orderedCompare(ProfileRuleValueResolver.ResolvedValue actual, Object expected) {
        if (actual.type() == ProfileRuleValueResolver.ValueType.BOOLEAN) {
            throw new IllegalArgumentException("Boolean values cannot use ordered operators");
        }
        return compare(actual, expected);
    }

    private int compare(ProfileRuleValueResolver.ResolvedValue actual, Object expected) {
        return switch (actual.type()) {
            case STRING -> actual.value().toString().compareToIgnoreCase(expected.toString());
            case NUMBER -> ((BigDecimal) actual.value()).compareTo((BigDecimal) expected);
            case BOOLEAN -> Boolean.compare((Boolean) actual.value(), (Boolean) expected);
        };
    }

    enum EvaluationKind { PASS, FAIL, MISSING, UNSUPPORTED, INVALID }

    record Evaluation(EvaluationKind kind, String actualValue) {
        static Evaluation missing() { return new Evaluation(EvaluationKind.MISSING, null); }
        static Evaluation unsupported() { return new Evaluation(EvaluationKind.UNSUPPORTED, null); }
        static Evaluation invalid(String actual) { return new Evaluation(EvaluationKind.INVALID, actual); }
    }
}
