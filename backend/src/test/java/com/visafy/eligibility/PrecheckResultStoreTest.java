package com.visafy.eligibility;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.visafy.eligibility.EligibilityResult.RuleDetail;
import com.visafy.profile.TempProfile;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class PrecheckResultStoreTest {
    private final PrecheckResultRepository repository = mock(PrecheckResultRepository.class);
    private final PrecheckResultStore store = new PrecheckResultStore(repository);
    private PrecheckResultEntity saved;

    @BeforeEach
    void setUp() {
        when(repository.save(any())).thenAnswer(invocation -> {
            saved = invocation.getArgument(0);
            return saved;
        });
    }

    @Test
    void savesAndRebuildsNormalizedRuleOutcomes() {
        TempProfile profile = mock(TempProfile.class);
        when(profile.getId()).thenReturn(7L);
        when(profile.getExpiresAt()).thenReturn(Instant.now().plusSeconds(3600));
        RuleDetail passed = detail(10L, "AGE", "RULE_PASS");
        RuleDetail external = detail(11L, "GUARANTEE", "EXTERNAL_CHECK");
        RuleDetail insufficient = detail(null, "PRODUCT_SOURCE", "SOURCE_NOT_EFFECTIVE");
        EligibilityResult input = new EligibilityResult(EligibilityStatus.INSUFFICIENT_INFORMATION, 3L,
                List.of(passed), List.of(), List.of(external), List.of(), List.of(insufficient), "not final");

        PrecheckResultStore.StoredPrecheck created = store.save("session-uuid", profile, input,
                LocalDate.of(2026, 8, 18));
        when(repository.findOneById(created.id())).thenReturn(Optional.of(saved));
        PrecheckResultStore.StoredPrecheck restored = store.get(created.id(), "session-uuid");

        assertThat(restored.result().passedRules()).extracting(RuleDetail::key).containsExactly("AGE");
        assertThat(restored.result().externalChecks()).extracting(RuleDetail::key).containsExactly("GUARANTEE");
        assertThat(restored.result().insufficientReasons()).extracting(RuleDetail::key)
                .containsExactly("PRODUCT_SOURCE");
        assertThat(restored.informationBaseDate()).isEqualTo(LocalDate.of(2026, 8, 18));
    }

    @Test
    void hidesResultFromAnotherSession() {
        TempProfile profile = mock(TempProfile.class);
        when(profile.getId()).thenReturn(7L);
        when(profile.getExpiresAt()).thenReturn(Instant.now().plusSeconds(3600));
        EligibilityResult input = new EligibilityResult(EligibilityStatus.PUBLIC_CONDITIONS_MET, 3L,
                List.of(), List.of(), List.of(), List.of(), List.of(), "not final");
        PrecheckResultStore.StoredPrecheck created = store.save("owner-session", profile, input, LocalDate.now());
        when(repository.findOneById(created.id())).thenReturn(Optional.of(saved));

        assertThatThrownBy(() -> store.get(created.id(), "other-session"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404 NOT_FOUND");
    }

    private RuleDetail detail(Long id, String key, String code) {
        return new RuleDetail(id, key, code, key + " message", "actual", "expected", true, true,
                "official excerpt", "page 1", "https://example.com/official");
    }
}
