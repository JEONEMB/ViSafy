package com.visafy.assistant;

import com.visafy.assistant.AiExplanationClient.ConditionInput;
import com.visafy.assistant.AiExplanationClient.AccessDetailInput;
import com.visafy.assistant.AiExplanationClient.AccessResultInput;
import com.visafy.assistant.AiExplanationClient.ExplanationRequest;
import com.visafy.assistant.AiExplanationClient.ExplanationResponse;
import com.visafy.eligibility.EligibilityResult;
import com.visafy.eligibility.EligibilityResult.RuleDetail;
import com.visafy.eligibility.EligibilityService;
import com.visafy.product.FinancialProduct;
import com.visafy.product.FinancialProductRepository;
import com.visafy.profile.TempProfile;
import com.visafy.profile.TempProfileService;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Stream;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AiExplanationService {
    private final TempProfileService profileService;
    private final FinancialProductRepository productRepository;
    private final EligibilityService eligibilityService;
    private final AiExplanationClient aiClient;

    public AiExplanationService(TempProfileService profileService,
                                FinancialProductRepository productRepository,
                                EligibilityService eligibilityService,
                                AiExplanationClient aiClient) {
        this.profileService = profileService;
        this.productRepository = productRepository;
        this.eligibilityService = eligibilityService;
        this.aiClient = aiClient;
    }

    public ExplanationResult explain(String profileSessionId, Long productId) {
        TempProfile profile = profileService.getBySessionId(profileSessionId.strip());
        FinancialProduct product = productRepository.findOneById(productId)
                .filter(FinancialProduct::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        EligibilityResult eligibility = eligibilityService.precheck(profile, product);
        LocalDate today = LocalDate.now();
        Long visaRemainingMonths = profile.getVisaExpiry() == null ? null
                : Math.max(0, ChronoUnit.MONTHS.between(today, profile.getVisaExpiry()));
        Long residencyMonths = profile.getResidencyStartDate() == null ? null
                : Math.max(0, ChronoUnit.MONTHS.between(profile.getResidencyStartDate(), today));

        ExplanationRequest request = new ExplanationRequest(
                eligibility.productId(), eligibility.status().name(), normalizeLanguage(profile.getLanguage()), product.getProductName(),
                product.getInstitution(), profile.getVisaType(), visaRemainingMonths, residencyMonths,
                eligibility.passedRules().size(), eligibility.failedRules().size(),
                conditions(eligibility.externalChecks()), conditions(eligibility.unknownRules()),
                allConditions(eligibility), termKeys(eligibility), accessResult(eligibility), List.of());
        ExplanationResponse response = aiClient.explain(request);
        StructuredFacts facts = new StructuredFacts(profile.getVisaType(), visaRemainingMonths, residencyMonths,
                eligibility.passedRules().size(), eligibility.failedRules().size(),
                eligibility.externalChecks().size(), eligibility.unknownRules().size());
        return new ExplanationResult(eligibility.status().name(),
                eligibility.accessAssessment().status().name(), facts, response.explanation(),
                response.nextActions(), response.disclaimer(), response.easyTerms(), response.inquiry(),
                response.guardrailsApplied());
    }

    private AccessResultInput accessResult(EligibilityResult eligibility) {
        var access = eligibility.accessAssessment();
        List<AccessDetailInput> details = access.details().stream().map(detail -> new AccessDetailInput(
                detail.category(), detail.key(), detail.messageCode(), detail.message(), detail.sourceExcerpt(),
                detail.sourceLocator(), detail.sourceUrl())).toList();
        return new AccessResultInput(access.status().name(), access.identification().name(),
                access.branch().name(), access.online().name(), details,
                access.realNameGuardrailApplied());
    }

    private List<ConditionInput> conditions(List<RuleDetail> details) {
        return details.stream().map(detail -> new ConditionInput(
                detail.key(), detail.messageCode(), detail.actualValue(), detail.expectedValue(),
                detail.sourceExcerpt(), detail.sourceLocator(), detail.sourceUrl())).toList();
    }

    private List<ConditionInput> allConditions(EligibilityResult eligibility) {
        return Stream.of(eligibility.passedRules(), eligibility.failedRules(), eligibility.externalChecks(),
                        eligibility.unknownRules(), eligibility.insufficientReasons())
                .flatMap(List::stream)
                .map(detail -> new ConditionInput(detail.key(), detail.messageCode(), detail.actualValue(),
                        detail.expectedValue(), detail.sourceExcerpt(), detail.sourceLocator(), detail.sourceUrl()))
                .toList();
    }

    private List<String> termKeys(EligibilityResult eligibility) {
        Set<String> terms = new LinkedHashSet<>();
        Stream.of(eligibility.passedRules(), eligibility.failedRules(), eligibility.externalChecks(),
                        eligibility.unknownRules(), eligibility.insufficientReasons())
                .flatMap(List::stream)
                .map(RuleDetail::key)
                .map(key -> key == null ? "" : key.toUpperCase(Locale.ROOT))
                .forEach(key -> {
                    if (key.contains("VISA") || key.contains("STATUS_OF_STAY")) terms.add("STATUS_OF_STAY");
                    if (key.contains("INCOME") || key.contains("EMPLOYMENT")) terms.add("PROOF_OF_INCOME");
                    if (key.contains("GUARANTEE")) terms.add("GUARANTEE_INSURANCE_CERTIFICATE");
                    if (key.contains("CREDIT") || key.contains("BANK_REVIEW")) {
                        terms.add("INTERNAL_CREDIT_REVIEW");
                    }
                });
        return List.copyOf(terms);
    }

    private String normalizeLanguage(String language) {
        return switch (language == null ? "ko" : language.toLowerCase(Locale.ROOT)) {
            case "en", "vi" -> language.toLowerCase(Locale.ROOT);
            default -> "ko";
        };
    }

    public record StructuredFacts(
            String visaType, Long visaRemainingMonths, Long residencyMonths, int passedCount,
            int failedCount, int externalCheckCount, int unknownCount
    ) {}
    public record ExplanationResult(
            String eligibilityStatus, String accessStatus, StructuredFacts facts, String explanation,
            List<String> nextActions, String disclaimer,
            List<AiExplanationClient.EasyTerm> easyTerms, AiExplanationClient.BankInquiry inquiry,
            List<String> guardrailsApplied
    ) {}
}
