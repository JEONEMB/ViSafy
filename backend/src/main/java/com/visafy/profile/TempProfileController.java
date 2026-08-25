package com.visafy.profile;

import com.visafy.profile.TempProfile.ProfileData;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@RequestMapping("/api/profiles")
public class TempProfileController {
    private final TempProfileService service;

    public TempProfileController(TempProfileService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProfileResponse create(@Valid @RequestBody ProfileRequest request) {
        return ProfileResponse.from(service.create(request.toData()));
    }

    @GetMapping("/{id}")
    public ProfileResponse get(@PathVariable Long id,
                               @RequestHeader("X-Profile-Session-Id") String sessionId) {
        return ProfileResponse.from(service.getOwned(id, sessionId));
    }

    @PutMapping("/{id}")
    public ProfileResponse update(@PathVariable Long id,
                                  @RequestHeader("X-Profile-Session-Id") String sessionId,
                                  @Valid @RequestBody ProfileRequest request) {
        return ProfileResponse.from(service.updateOwned(id, sessionId, request.toData()));
    }

    public record ProfileRequest(
            @NotBlank String nationality,
            LocalDate birthDate,
            String visaType,
            LocalDate visaExpiry,
            LocalDate residencyStartDate,
            String occupation,
            String employmentType,
            @DecimalMin("0.0") BigDecimal monthlyIncome,
            @Min(0) Integer employmentDurationMonths,
            @NotBlank String financialPurpose,
            @NotBlank @Pattern(regexp = "ko|en|vi|zh|ja|th") String language,
            Boolean hasBankAccount,
            String housingType,
            @DecimalMin("0.0") BigDecimal desiredAmount,
            String preferredBank,
            ResidentStatus residentStatus,
            Boolean hasExistingProductAccount,
            @DecimalMin("0.0") BigDecimal desiredMonthlyAmount,
            Boolean hasResidenceCard,
            Boolean hasPassport,
            Boolean hasDomesticPhone,
            Boolean canDomesticPhoneVerify,
            Boolean hasKoreanBankAccount,
            Boolean hasKoreanCreditHistory,
            String preferredChannel,
            String remittanceCountry
    ) {
        ProfileData toData() {
            return new ProfileData(nationality.strip(), birthDate, clean(visaType), visaExpiry, residencyStartDate,
                    clean(occupation), clean(employmentType), monthlyIncome, employmentDurationMonths,
                    financialPurpose.strip(), language, hasBankAccount, housingType, desiredAmount, preferredBank,
                    residentStatus, hasExistingProductAccount, desiredMonthlyAmount, hasResidenceCard, hasPassport,
                    hasDomesticPhone, canDomesticPhoneVerify, hasKoreanBankAccount, hasKoreanCreditHistory,
                    preferredChannel, remittanceCountry);
        }

        private String clean(String value) { return value == null || value.isBlank() ? null : value.strip(); }
    }

    public record ProfileResponse(
            Long id, String sessionId, String nationality, LocalDate birthDate, String visaType,
            LocalDate visaExpiry, LocalDate residencyStartDate, String occupation, String employmentType,
            BigDecimal monthlyIncome, Integer employmentDurationMonths, String financialPurpose, String language,
            Boolean hasBankAccount, String housingType, BigDecimal desiredAmount, String preferredBank,
            ResidentStatus residentStatus, Boolean hasExistingProductAccount, BigDecimal desiredMonthlyAmount,
            Boolean hasResidenceCard, Boolean hasPassport, Boolean hasDomesticPhone,
            Boolean canDomesticPhoneVerify, Boolean hasKoreanBankAccount, Boolean hasKoreanCreditHistory,
            String preferredChannel, String remittanceCountry,
            Instant expiresAt
    ) {
        static ProfileResponse from(TempProfile profile) {
            return new ProfileResponse(profile.getId(), profile.getSessionId(), profile.getNationality(),
                    profile.getBirthDate(), profile.getVisaType(), profile.getVisaExpiry(),
                    profile.getResidencyStartDate(), profile.getOccupation(), profile.getEmploymentType(),
                    profile.getMonthlyIncome(), profile.getEmploymentDurationMonths(), profile.getFinancialPurpose(),
                    profile.getLanguage(), profile.getHasBankAccount(), profile.getHousingType(),
                    profile.getDesiredAmount(), profile.getPreferredBank(), profile.getResidentStatus(),
                    profile.getHasExistingProductAccount(), profile.getDesiredMonthlyAmount(),
                    profile.getHasResidenceCard(), profile.getHasPassport(), profile.getHasDomesticPhone(),
                    profile.getCanDomesticPhoneVerify(), profile.getHasKoreanBankAccount(),
                    profile.getHasKoreanCreditHistory(), profile.getPreferredChannel(),
                    profile.getRemittanceCountry(), profile.getExpiresAt());
        }
    }
}
