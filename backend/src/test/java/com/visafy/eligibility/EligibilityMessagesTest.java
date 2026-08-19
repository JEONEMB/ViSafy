package com.visafy.eligibility;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class EligibilityMessagesTest {
    @Test
    void createsKoreanEnglishAndVietnameseMessages() {
        assertThat(new EligibilityMessages("ko").disclaimer()).contains("최종 가입승인");
        assertThat(new EligibilityMessages("en").disclaimer()).contains("not final approval");
        assertThat(new EligibilityMessages("vi").disclaimer()).contains("không phải phê duyệt cuối cùng");
    }
}
