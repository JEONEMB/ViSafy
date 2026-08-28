package com.visafy.rag;

import com.visafy.eligibility.EligibilityResult;
import com.visafy.eligibility.EligibilityResult.RuleDetail;
import com.visafy.eligibility.EligibilityService;
import com.visafy.product.FinancialProduct;
import com.visafy.product.FinancialProductRepository;
import com.visafy.profile.TempProfile;
import com.visafy.profile.TempProfileService;
import com.visafy.rag.RagAiClient.RagAnswerRequest;
import com.visafy.rag.RagAiClient.RagAnswerResponse;
import java.util.Locale;
import java.util.stream.Stream;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RagService {
    private final TempProfileService profileService;
    private final FinancialProductRepository productRepository;
    private final EligibilityService eligibilityService;
    private final RagAiClient aiClient;

    public RagService(TempProfileService profileService, FinancialProductRepository productRepository,
                      EligibilityService eligibilityService, RagAiClient aiClient) {
        this.profileService = profileService;
        this.productRepository = productRepository;
        this.eligibilityService = eligibilityService;
        this.aiClient = aiClient;
    }

    public RagAnswerResponse answer(String profileSessionId, Long productId, String ruleKey,
                                    String query, int topK) {
        return answer(profileSessionId, productId, ruleKey, query, topK, "");
    }

    public RagAnswerResponse answer(String profileSessionId, Long productId, String ruleKey,
                                    String query, int topK, String conversationContext) {
        TempProfile profile = profileService.getBySessionId(profileSessionId.strip());
        FinancialProduct product = productRepository.findOneById(productId)
                .filter(FinancialProduct::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        EligibilityResult eligibility = eligibilityService.precheck(profile, product);
        String normalizedKey = ruleKey.strip().toUpperCase(Locale.ROOT);
        RuleDetail rule = Stream.of(eligibility.passedRules(), eligibility.failedRules(),
                        eligibility.externalChecks(), eligibility.unknownRules(), eligibility.insufficientReasons())
                .flatMap(java.util.Collection::stream)
                .filter(detail -> normalizedKey.equalsIgnoreCase(detail.key()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Rule is not available for this product"));
        return aiClient.answer(new RagAnswerRequest(productId, normalizedKey, query.strip(), topK,
                eligibility.status().name(), rule.message(), profile.getLanguage(),
                conversationContext == null ? "" : conversationContext.strip()));
    }
}
