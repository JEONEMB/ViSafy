package com.visafy.profile;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class SensitiveDataGuardTest {
    @Test
    void rejectsResidentAlienPassportAccountAndCardNumbers() {
        assertRejected("900101-1234567");
        assertRejected("ABC M12345678");
        assertRejected("110-123-456789");
        assertRejected("4111 1111 1111 1111");
    }

    @Test
    void acceptsOrdinaryProfileText() {
        assertThatCode(() -> SensitiveDataGuard.rejectProhibitedValues(
                "Office worker", "FULL_TIME", "Housing loan", "Monthly rent", "KB Bank"))
                .doesNotThrowAnyException();
    }

    private void assertRejected(String value) {
        assertThatThrownBy(() -> SensitiveDataGuard.rejectProhibitedValues(value))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("400 BAD_REQUEST");
    }
}
