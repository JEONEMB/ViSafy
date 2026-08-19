package com.visafy.eligibility;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visafy.common.domain.ReviewStatus;
import com.visafy.eligibility.EligibilityResult.RuleDetail;
import com.visafy.product.FinancialProduct;
import com.visafy.product.FinancialProductRepository;
import com.visafy.product.ProductRule;
import com.visafy.product.ProductRuleRepository;
import com.visafy.profile.TempProfile;
import com.visafy.profile.TempProfileService;
import com.visafy.rule.RuleCandidate;
import com.visafy.rule.RuleCandidateRepository;
import com.visafy.rule.RuleLevel;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EligibilityService {
    private final TempProfileService profileService;
    private final FinancialProductRepository productRepository;
    private final ProductRuleRepository ruleRepository;
    private final RuleCandidateRepository candidateRepository;
    private final RuleEvaluator evaluator;

    public EligibilityService(TempProfileService profileService, FinancialProductRepository productRepository,
                              ProductRuleRepository ruleRepository, RuleCandidateRepository candidateRepository,
                              ObjectMapper objectMapper) {
        this.profileService = profileService;
        this.productRepository = productRepository;
        this.ruleRepository = ruleRepository;
        this.candidateRepository = candidateRepository;
        this.evaluator = new RuleEvaluator(objectMapper);
    }

    public EligibilityResult precheck(String profileSessionId, Long productId) {
        TempProfile profile = profileService.getBySessionId(profileSessionId.strip());
        FinancialProduct product = productRepository.findOneById(productId)
                .filter(FinancialProduct::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        LocalDate today = LocalDate.now();
        EligibilityMessages messages = new EligibilityMessages(profile.getLanguage());
        List<RuleDetail> passed = new ArrayList<>();
        List<RuleDetail> failed = new ArrayList<>();
        List<RuleDetail> external = new ArrayList<>();
        List<RuleDetail> unknown = new ArrayList<>();
        Map<String, RuleDetail> insufficient = new LinkedHashMap<>();

        if (!product.getSourceDocument().isEffective(today)) {
            addInsufficient(insufficient, null, "PRODUCT_SOURCE", InsufficientReasonCode.SOURCE_NOT_EFFECTIVE,
                    true, null, product.getSourceDocument().getSourceUrl(), messages);
        }

        List<ProductRule> activeRules = ruleRepository
                .findByProductIdAndActiveTrueOrderByRuleKeyAsc(productId);
        for (ProductRule rule : activeRules) {
            if (!rule.getSourceDocument().isEffective(today)) {
                addInsufficient(insufficient, rule, rule.getRuleKey(),
                        InsufficientReasonCode.SOURCE_NOT_EFFECTIVE, rule.isMandatory(),
                        rule.getSourceLocator(), rule.getSourceDocument().getSourceUrl(), messages);
            }
        }
        List<ProductRule> rules = activeRules.stream().filter(rule -> rule.isEffective(today)).toList();
        inspectCandidateState(product, today, insufficient, messages);

        boolean hasRequiredVisaRule = rules.stream().anyMatch(rule -> rule.isMandatory()
                && rule.getRuleLevel() == RuleLevel.HARD
                && "VISA_TYPE".equalsIgnoreCase(rule.getRuleKey()));
        if (!hasRequiredVisaRule) {
            addInsufficient(insufficient, null, "VISA_TYPE", InsufficientReasonCode.INSUFFICIENT_RULES,
                    true, null, product.getSourceDocument().getSourceUrl(), messages);
        }

        for (ProductRule rule : rules) {
            switch (rule.getRuleLevel()) {
                case EXTERNAL_CHECK -> external.add(detail(rule, "EXTERNAL_CHECK",
                        messages.external(rule.getDescription()), null, rule.getRuleValue(), true));
                case UNKNOWN -> unknown.add(detail(rule, "UNKNOWN_CONDITION",
                        messages.unknown(rule.getSourceExcerpt(), profile.getVisaType()), profile.getVisaType(),
                        rule.getRuleValue(), rule.isMandatory()));
                case HARD -> evaluateHardRule(rule, profile, today, passed, failed, unknown, insufficient, messages);
            }
        }

        boolean blockingInsufficient = insufficient.values().stream().anyMatch(RuleDetail::blocking);
        boolean mandatoryUnknown = unknown.stream().anyMatch(RuleDetail::blocking);
        EligibilityStatus status;
        if (!failed.isEmpty()) status = EligibilityStatus.PUBLIC_CONDITIONS_NOT_MET;
        else if (blockingInsufficient) status = EligibilityStatus.INSUFFICIENT_INFORMATION;
        else if (!external.isEmpty() || mandatoryUnknown) status = EligibilityStatus.NEED_BANK_CONFIRMATION;
        else status = EligibilityStatus.PUBLIC_CONDITIONS_MET;

        return new EligibilityResult(status, productId, List.copyOf(passed), List.copyOf(failed),
                List.copyOf(external), List.copyOf(unknown), List.copyOf(insufficient.values()),
                messages.disclaimer());
    }

    private void evaluateHardRule(ProductRule rule, TempProfile profile, LocalDate today,
                                  List<RuleDetail> passed, List<RuleDetail> failed, List<RuleDetail> unknown,
                                  Map<String, RuleDetail> insufficient, EligibilityMessages messages) {
        RuleEvaluator.Evaluation evaluation = evaluator.evaluate(rule, profile, today);
        switch (evaluation.kind()) {
            case PASS -> passed.add(detail(rule, "RULE_PASSED",
                    messages.passed(rule.getRuleKey(), evaluation.actualValue(), rule.getRuleValue()),
                    evaluation.actualValue(), rule.getRuleValue(), false));
            case FAIL -> failed.add(detail(rule, "RULE_FAILED",
                    messages.failed(rule.getRuleKey(), evaluation.actualValue(), rule.getRuleValue()),
                    evaluation.actualValue(), rule.getRuleValue(), true));
            case MISSING -> addInsufficient(insufficient, rule, rule.getRuleKey(),
                    InsufficientReasonCode.MISSING_PROFILE_INPUT, rule.isMandatory(), rule.getSourceLocator(),
                    rule.getSourceDocument().getSourceUrl(), messages);
            case INVALID -> addInsufficient(insufficient, rule, rule.getRuleKey(),
                    InsufficientReasonCode.INVALID_RULE_VALUE, rule.isMandatory(), rule.getSourceLocator(),
                    rule.getSourceDocument().getSourceUrl(), messages);
            case UNSUPPORTED -> {
                if (rule.isMandatory()) {
                    addInsufficient(insufficient, rule, rule.getRuleKey(),
                            InsufficientReasonCode.UNSUPPORTED_RULE_KEY, true, rule.getSourceLocator(),
                            rule.getSourceDocument().getSourceUrl(), messages);
                } else {
                    unknown.add(detail(rule, "UNSUPPORTED_OPTIONAL_RULE", messages.optionalUnsupported(rule.getRuleKey()),
                            null, rule.getRuleValue(), false));
                }
            }
        }
    }

    private void inspectCandidateState(FinancialProduct product, LocalDate today,
                                       Map<String, RuleDetail> insufficient, EligibilityMessages messages) {
        List<RuleCandidate> candidates = candidateRepository
                .findByProductCodeOrderByCreatedAtDesc(product.getProductCode()).stream()
                .filter(candidate -> within(candidate.getValidFrom(), candidate.getValidTo(), today))
                .filter(candidate -> within(candidate.getSourceDocument().getValidFrom(),
                        candidate.getSourceDocument().getValidTo(), today))
                .filter(candidate -> candidate.getReviewStatus() == ReviewStatus.PENDING
                        || candidate.getReviewStatus() == ReviewStatus.NEED_REVIEW)
                .toList();
        Map<String, List<RuleCandidate>> byKey = candidates.stream().collect(
                java.util.stream.Collectors.groupingBy(candidate -> candidate.getRuleKey().toUpperCase(Locale.ROOT)));
        byKey.forEach((key, values) -> {
            boolean conflict = values.size() > 1 && values.stream()
                    .map(candidate -> candidate.getOperator() + "\u0000" + candidate.getRuleValue())
                    .distinct().count() > 1;
            RuleCandidate sample = values.getFirst();
            addInsufficient(insufficient, null, key,
                    conflict ? InsufficientReasonCode.SOURCE_CONFLICT
                            : InsufficientReasonCode.RULE_REVIEW_INCOMPLETE,
                    values.stream().anyMatch(RuleCandidate::isMandatory), sample.getSourceLocator(),
                    sample.getSourceDocument().getSourceUrl(), messages);
        });
    }

    private boolean within(LocalDate from, LocalDate to, LocalDate today) {
        return (from == null || !from.isAfter(today)) && (to == null || !to.isBefore(today));
    }

    private void addInsufficient(Map<String, RuleDetail> target, ProductRule rule, String key,
                                 InsufficientReasonCode code, boolean blocking, String locator, String sourceUrl,
                                 EligibilityMessages messages) {
        String mapKey = code + ":" + key;
        target.putIfAbsent(mapKey, new RuleDetail(rule == null ? null : rule.getId(), key, code.name(),
                messages.insufficient(code, key), null, rule == null ? null : rule.getRuleValue(),
                rule == null ? blocking : rule.isMandatory(), blocking,
                rule == null ? null : rule.getSourceExcerpt(), locator, sourceUrl));
    }

    private RuleDetail detail(ProductRule rule, String code, String message, String actual, String expected,
                              boolean blocking) {
        return new RuleDetail(rule.getId(), rule.getRuleKey(), code, message, actual, expected,
                rule.isMandatory(), blocking, rule.getSourceExcerpt(), rule.getSourceLocator(),
                rule.getSourceDocument().getSourceUrl());
    }
}
