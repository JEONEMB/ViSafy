package com.visafy.eligibility;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class EligibilityMessagesTest {
    @Test
    void createsAMessageInEverySupportedLanguage() {
        assertThat(new EligibilityMessages("ko").disclaimer())
                .contains("금융기관의 최종 심사 결과에 따라 달라질 수 있습니다");
        assertThat(new EligibilityMessages("en").disclaimer()).contains("not final approval");
        assertThat(new EligibilityMessages("vi").disclaimer()).contains("không phải phê duyệt cuối cùng");
        assertThat(new EligibilityMessages("zh").disclaimer()).contains("金融机构的最终审核结果");
        assertThat(new EligibilityMessages("ja").disclaimer()).contains("金融機関の最終審査結果");
        assertThat(new EligibilityMessages("th").disclaimer()).contains("สถาบันการเงิน");
    }

    @Test
    void translatesRuleLabelsInsteadOfFallingBackToEnglish() {
        assertThat(new EligibilityMessages("zh").passed("VISA_TYPE", "F-2", "F-2")).contains("签证类型");
        assertThat(new EligibilityMessages("ja").passed("VISA_TYPE", "F-2", "F-2")).contains("ビザの種類");
        assertThat(new EligibilityMessages("th").passed("VISA_TYPE", "F-2", "F-2")).contains("ประเภทวีซ่า");
    }

    @Test
    void fallsBackToKoreanForAnUnsupportedLanguage() {
        assertThat(new EligibilityMessages("fr").disclaimer()).contains("사전자격 안내");
        assertThat(new EligibilityMessages(null).disclaimer()).contains("사전자격 안내");
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
