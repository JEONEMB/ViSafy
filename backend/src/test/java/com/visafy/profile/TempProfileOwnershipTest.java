package com.visafy.profile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class TempProfileOwnershipTest {
    private final TempProfileRepository repository = mock(TempProfileRepository.class);
    private final VisaCatalog visaCatalog = mock(VisaCatalog.class);
    private final TempProfileService service = new TempProfileService(repository, visaCatalog);

    @Test
    void numericIdCannotAccessAnotherSessionProfile() {
        TempProfile profile = mock(TempProfile.class);
        when(profile.getId()).thenReturn(12L);
        when(profile.getExpiresAt()).thenReturn(Instant.now().plusSeconds(3600));
        when(repository.findBySessionId("owner-session")).thenReturn(Optional.of(profile));

        assertThat(service.getOwned(12L, "owner-session")).isSameAs(profile);
        assertThatThrownBy(() -> service.getOwned(99L, "owner-session"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404 NOT_FOUND");
    }
}
