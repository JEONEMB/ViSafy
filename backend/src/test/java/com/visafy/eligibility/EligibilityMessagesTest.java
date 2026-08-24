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
}
