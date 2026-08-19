package com.visafy.eligibility;

import com.visafy.eligibility.EligibilityResult.RuleDetail;
import com.visafy.execution.ApiExecutionHistoryService;
import com.visafy.profile.TempProfile;
import jakarta.transaction.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PrecheckResultStore {
    private final PrecheckResultRepository repository;
    public PrecheckResultStore(PrecheckResultRepository repository) { this.repository = repository; }

    @Transactional
    public StoredPrecheck save(String sessionId, TempProfile profile, EligibilityResult result,
                               LocalDate informationBaseDate) {
        Instant now = Instant.now(); Instant expiresAt = profile.getExpiresAt();
        PrecheckResultEntity entity = new PrecheckResultEntity(UUID.randomUUID().toString(),
                ApiExecutionHistoryService.hashSessionId(sessionId), profile.getId(), result.productId(),
                result.status(), informationBaseDate, result.disclaimer(), now, expiresAt);
        add(entity, PrecheckRuleOutcome.PASS, result.passedRules());
        add(entity, PrecheckRuleOutcome.FAIL, result.failedRules());
        add(entity, PrecheckRuleOutcome.EXTERNAL_CHECK, result.externalChecks());
        add(entity, PrecheckRuleOutcome.UNKNOWN, result.unknownRules());
        add(entity, PrecheckRuleOutcome.NOT_APPLICABLE, result.insufficientReasons());
        repository.save(entity);
        return toStored(entity);
    }

    @Transactional
    public StoredPrecheck get(String id, String sessionId) {
        PrecheckResultEntity entity = repository.findOneById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pre-check result not found"));
        if (entity.getExpiresAt().isBefore(Instant.now())) throw new ResponseStatusException(HttpStatus.GONE, "Pre-check result has expired");
        if (!MessageDigest.isEqual(entity.getProfileSessionHash().getBytes(StandardCharsets.UTF_8),
                ApiExecutionHistoryService.hashSessionId(sessionId).getBytes(StandardCharsets.UTF_8)))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pre-check result not found");
        return toStored(entity);
    }

    private void add(PrecheckResultEntity entity, PrecheckRuleOutcome outcome, List<RuleDetail> details) {
        details.forEach(detail -> entity.add(new PrecheckRuleResultEntity(entity, outcome, detail)));
    }
    private StoredPrecheck toStored(PrecheckResultEntity entity) {
        List<RuleDetail> pass = new ArrayList<>(), fail = new ArrayList<>(), external = new ArrayList<>(), unknown = new ArrayList<>(), insufficient = new ArrayList<>();
        entity.getRuleResults().forEach(value -> { switch (value.getResult()) { case PASS -> pass.add(value.toDetail()); case FAIL -> fail.add(value.toDetail()); case EXTERNAL_CHECK -> external.add(value.toDetail()); case UNKNOWN -> unknown.add(value.toDetail()); case NOT_APPLICABLE -> insufficient.add(value.toDetail()); } });
        EligibilityResult result = new EligibilityResult(entity.getStatus(), entity.getProductId(), pass, fail, external, unknown, insufficient, entity.getDisclaimer());
        return new StoredPrecheck(entity.getId(), result, entity.getInformationBaseDate(), entity.getCreatedAt(), entity.getExpiresAt());
    }
    public record StoredPrecheck(String id, EligibilityResult result, LocalDate informationBaseDate,
                                 Instant createdAt, Instant expiresAt) {}
}
