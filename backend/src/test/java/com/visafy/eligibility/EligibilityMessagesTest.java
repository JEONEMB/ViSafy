package com.visafy.eligibility;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class EligibilityMessagesTest {
    @Test
    void createsKoreanEnglishAndVietnameseMessages() {
        assertThat(new EligibilityMessages("ko").disclaimer())
                .contains("금융기관의 최종 심사 결과에 따라 달라질 수 있습니다");
        assertThat(new EligibilityMessages("en").disclaimer()).contains("not final approval");
        assertThat(new EligibilityMessages("vi").disclaimer()).contains("không phải phê duyệt cuối cùng");
    }

    @Test
    void nonVisaUnknownNeverInventsVisaContext() {
        String message = new EligibilityMessages("ko")
                .unknown("MOBILE_CHANNEL", "모바일 신청 가능 여부는 별도 확인", null);

        assertThat(message).contains("금융기관 확인이 필요합니다")
                .doesNotContain("null", "비자에 대한");
    }

    @Test
    void visaUnknownUsesStructuredVisaOnlyWhenProvided() {
        assertThat(new EligibilityMessages("en")
                .unknown("VISA_DETAIL", "accepted visa list is not public", "E-9"))
                .contains("visa E-9");
    }
}
