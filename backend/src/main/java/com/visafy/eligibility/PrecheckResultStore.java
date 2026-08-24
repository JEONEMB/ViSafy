package com.visafy.eligibility;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.visafy.access.AccessAssessment;
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
    private final ObjectMapper objectMapper;
    public PrecheckResultStore(PrecheckResultRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public StoredPrecheck save(String sessionId, TempProfile profile, EligibilityResult result,
                               LocalDate informationBaseDate) {
        Instant now = Instant.now(); Instant expiresAt = profile.getExpiresAt();
        PrecheckResultEntity entity = new PrecheckResultEntity(UUID.randomUUID().toString(),
                ApiExecutionHistoryService.hashSessionId(sessionId), profile.getId(), result.productId(),
                result.status(), informationBaseDate, result.disclaimer(),
                String.join(",", result.requiredFields()), result.accessAssessment().status(),
                writeAccess(result.accessAssessment()), now, expiresAt);
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
        List<String> requiredFields = entity.getRequiredFields() == null || entity.getRequiredFields().isBlank()
                ? List.of() : List.of(entity.getRequiredFields().split(","));
        EligibilityResult result = new EligibilityResult(entity.getStatus(), entity.getProductId(), pass, fail,
                external, unknown, insufficient, requiredFields, readAccess(entity), entity.getDisclaimer());
        return new StoredPrecheck(entity.getId(), result, entity.getInformationBaseDate(), entity.getCreatedAt(), entity.getExpiresAt());
    }
    public record StoredPrecheck(String id, EligibilityResult result, LocalDate informationBaseDate,
                                 Instant createdAt, Instant expiresAt) {}

    private String writeAccess(AccessAssessment access) {
        try { return objectMapper.writeValueAsString(access); }
        catch (JsonProcessingException exception) { throw new IllegalStateException("Access assessment serialization failed", exception); }
    }

    private AccessAssessment readAccess(PrecheckResultEntity entity) {
        if (entity.getAccessAssessmentJson() == null || entity.getAccessAssessmentJson().isBlank())
            return AccessAssessment.unknown();
        try { return objectMapper.readValue(entity.getAccessAssessmentJson(), AccessAssessment.class); }
        catch (JsonProcessingException exception) { return AccessAssessment.unknown(); }
    }
}
