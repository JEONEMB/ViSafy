package com.visafy.profile;

import java.util.List;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

final class SensitiveDataGuard {
    private static final List<Pattern> PROHIBITED_PATTERNS = List.of(
            Pattern.compile("(?<!\\d)\\d{6}[- ]?[1-8]\\d{6}(?!\\d)"),
            Pattern.compile("(?<!\\d)(?:\\d[ -]?){9,18}\\d(?!\\d)"),
            Pattern.compile("(?i)(?<![A-Z0-9])[A-Z]{1,2}[- ]?\\d{7,9}(?![A-Z0-9])")
    );

    private SensitiveDataGuard() {}

    static void rejectProhibitedValues(String... values) {
        for (String value : values) {
            if (value == null || value.isBlank()) continue;
            if (PROHIBITED_PATTERNS.stream().anyMatch(pattern -> pattern.matcher(value).find())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Do not enter resident registration, alien registration, passport, account, or card numbers");
            }
        }
    }
}
