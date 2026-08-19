package com.visafy.eligibility;

import com.visafy.eligibility.EligibilityResult.RuleDetail;
import com.visafy.eligibility.PrecheckResultStore.StoredPrecheck;
import com.visafy.product.FinancialProduct;
import com.visafy.product.FinancialProductRepository;
import com.visafy.profile.TempProfile;
import com.visafy.profile.TempProfileService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/prechecks")
public class PrecheckExecutionController {
    private final EligibilityService eligibilityService;
    private final TempProfileService profileService;
    private final FinancialProductRepository productRepository;
    private final PrecheckResultStore resultStore;

    public PrecheckExecutionController(EligibilityService eligibilityService, TempProfileService profileService,
                                       FinancialProductRepository productRepository,
                                       PrecheckResultStore resultStore) {
        this.eligibilityService = eligibilityService;
        this.profileService = profileService;
        this.productRepository = productRepository;
        this.resultStore = resultStore;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PrecheckExecutionResponse create(@Valid @RequestBody PrecheckExecutionRequest request) {
        TempProfile profile = profileService.getBySessionId(request.profileSessionId());
        FinancialProduct product = productRepository.findOneById(request.productId())
                .filter(FinancialProduct::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        EligibilityResult result = eligibilityService.precheck(profile, product);
        StoredPrecheck stored = resultStore.save(request.profileSessionId(), profile, result,
                product.getInformationBaseDate());
        return PrecheckExecutionResponse.from(stored);
    }

    @GetMapping("/{id}")
    public PrecheckExecutionResponse get(@PathVariable String id,
                                         @RequestHeader("X-Profile-Session-Id") String profileSessionId) {
        return PrecheckExecutionResponse.from(resultStore.get(id, profileSessionId));
    }

    public record PrecheckExecutionRequest(@NotBlank String profileSessionId, @NotNull Long productId) {}
    public record PrecheckExecutionResponse(
            String id, Long productId, EligibilityStatus status, List<RuleDetail> passedRules,
            List<RuleDetail> failedRules, List<RuleDetail> externalChecks, List<RuleDetail> unknownRules,
            List<RuleDetail> insufficientReasons, LocalDate informationBaseDate, String disclaimer,
            Instant createdAt, Instant expiresAt
    ) {
        static PrecheckExecutionResponse from(StoredPrecheck stored) {
            EligibilityResult result = stored.result();
            return new PrecheckExecutionResponse(stored.id(), result.productId(), result.status(), result.passedRules(),
                    result.failedRules(), result.externalChecks(), result.unknownRules(),
                    result.insufficientReasons(), stored.informationBaseDate(), result.disclaimer(),
                    stored.createdAt(), stored.expiresAt());
        }
    }
}
