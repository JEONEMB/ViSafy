package com.visafy.journey;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.visafy.profile.TempProfile;
import com.visafy.profile.TempProfileService;
import org.junit.jupiter.api.Test;

class FinancialJourneyServiceTest {
    private final TempProfileService profileService = mock(TempProfileService.class);
    private final FinancialJourneyService service = new FinancialJourneyService(profileService);

    @Test
    void savingsWithoutKoreanAccountGuidesUserToAccountFirst() {
        TempProfile profile = mock(TempProfile.class);
        when(profileService.getBySessionId("session")).thenReturn(profile);
        when(profile.getFinancialPurpose()).thenReturn("SAVE_MONEY");
        when(profile.getLanguage()).thenReturn("ko");
        when(profile.getHasResidenceCard()).thenReturn(true);
        when(profile.getHasKoreanBankAccount()).thenReturn(false);

        FinancialJourneyResult result = service.get("session");

        assertThat(result.currentStep()).isEqualTo(2);
        assertThat(result.nextAction()).contains("적금을 알아보기 전에").contains("국내 계좌");
        assertThat(result.steps().get(1).status())
                .isEqualTo(FinancialJourneyResult.JourneyStepStatus.CURRENT);
    }

    @Test
    void identityPreparationComesBeforeEveryLaterPurpose() {
        TempProfile profile = mock(TempProfile.class);
        when(profileService.getBySessionId("session")).thenReturn(profile);
        when(profile.getFinancialPurpose()).thenReturn("INVEST");
        when(profile.getLanguage()).thenReturn("en");

        FinancialJourneyResult result = service.get("session");

        assertThat(result.currentStep()).isEqualTo(1);
        assertThat(result.nextAction()).contains("identity document");
    }
}
