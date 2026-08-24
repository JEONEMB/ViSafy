package com.visafy.profile;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
public class TempProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 36)
    private String sessionId;
    @Column(nullable = false, length = 80)
    private String nationality;
    @Column
    private LocalDate birthDate;
    @Column(length = 10)
    private String visaType;
    @Column
    private LocalDate visaExpiry;
    @Column
    private LocalDate residencyStartDate;
    @Column(length = 120)
    private String occupation;
    @Column(length = 80)
    private String employmentType;
    @Column(precision = 15, scale = 2)
    private BigDecimal monthlyIncome;
    @Column
    private Integer employmentDurationMonths;
    @Column(nullable = false, length = 120)
    private String financialPurpose;
    @Column(nullable = false, length = 10)
    private String language;
    private Boolean hasBankAccount;
    @Column(length = 80)
    private String housingType;
    @Column(precision = 15, scale = 2)
    private BigDecimal desiredAmount;
    @Column(length = 120)
    private String preferredBank;
    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private ResidentStatus residentStatus;
    private Boolean hasExistingProductAccount;
    @Column(precision = 15, scale = 2)
    private BigDecimal desiredMonthlyAmount;
    private Boolean hasResidenceCard;
    private Boolean hasPassport;
    private Boolean hasDomesticPhone;
    private Boolean canDomesticPhoneVerify;
    private Boolean hasKoreanBankAccount;
    private Boolean hasKoreanCreditHistory;
    @Column(length = 40)
    private String preferredChannel;
    @Column(length = 80)
    private String remittanceCountry;
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
    @Column(nullable = false)
    private Instant updatedAt;
    @Column(nullable = false)
    private Instant expiresAt;

    protected TempProfile() {
    }

    public TempProfile(String sessionId) {
        Instant now = Instant.now();
        this.sessionId = sessionId;
        this.createdAt = now;
        this.updatedAt = now;
        this.expiresAt = now.plusSeconds(24 * 60 * 60);
    }

    public void update(ProfileData data) {
        nationality = data.nationality(); birthDate = data.birthDate(); visaType = data.visaType();
        visaExpiry = data.visaExpiry(); residencyStartDate = data.residencyStartDate();
        occupation = data.occupation(); employmentType = data.employmentType(); monthlyIncome = data.monthlyIncome();
        employmentDurationMonths = data.employmentDurationMonths(); financialPurpose = data.financialPurpose();
        language = data.language(); hasBankAccount = data.hasBankAccount(); housingType = data.housingType();
        desiredAmount = data.desiredAmount(); preferredBank = data.preferredBank();
        residentStatus = data.residentStatus();
        hasExistingProductAccount = data.hasExistingProductAccount();
        desiredMonthlyAmount = data.desiredMonthlyAmount();
        hasResidenceCard = data.hasResidenceCard(); hasPassport = data.hasPassport();
        hasDomesticPhone = data.hasDomesticPhone(); canDomesticPhoneVerify = data.canDomesticPhoneVerify();
        hasKoreanBankAccount = data.hasKoreanBankAccount() == null ? data.hasBankAccount() : data.hasKoreanBankAccount();
        hasBankAccount = hasKoreanBankAccount;
        hasKoreanCreditHistory = data.hasKoreanCreditHistory();
        preferredChannel = data.preferredChannel(); remittanceCountry = data.remittanceCountry();
        updatedAt = Instant.now();
        expiresAt = updatedAt.plusSeconds(24 * 60 * 60);
    }

    public record ProfileData(String nationality, LocalDate birthDate, String visaType, LocalDate visaExpiry,
                              LocalDate residencyStartDate, String occupation, String employmentType,
                              BigDecimal monthlyIncome, Integer employmentDurationMonths, String financialPurpose,
                              String language, Boolean hasBankAccount, String housingType,
                              BigDecimal desiredAmount, String preferredBank, ResidentStatus residentStatus,
                              Boolean hasExistingProductAccount, BigDecimal desiredMonthlyAmount,
                              Boolean hasResidenceCard, Boolean hasPassport, Boolean hasDomesticPhone,
                              Boolean canDomesticPhoneVerify, Boolean hasKoreanBankAccount,
                              Boolean hasKoreanCreditHistory, String preferredChannel,
                              String remittanceCountry) {
        public ProfileData(String nationality, LocalDate birthDate, String visaType, LocalDate visaExpiry,
                           LocalDate residencyStartDate, String occupation, String employmentType,
                           BigDecimal monthlyIncome, Integer employmentDurationMonths, String financialPurpose,
                           String language, Boolean hasBankAccount, String housingType, BigDecimal desiredAmount,
                           String preferredBank, ResidentStatus residentStatus, Boolean hasExistingProductAccount,
                           BigDecimal desiredMonthlyAmount) {
            this(nationality, birthDate, visaType, visaExpiry, residencyStartDate, occupation, employmentType,
                    monthlyIncome, employmentDurationMonths, financialPurpose, language, hasBankAccount,
                    housingType, desiredAmount, preferredBank, residentStatus, hasExistingProductAccount,
                    desiredMonthlyAmount, null, null, null, null, hasBankAccount, null, null, null);
        }

        public ProfileData(String nationality, LocalDate birthDate, String visaType, LocalDate visaExpiry,
                           LocalDate residencyStartDate, String occupation, String employmentType,
                           BigDecimal monthlyIncome, Integer employmentDurationMonths, String financialPurpose,
                           String language, Boolean hasBankAccount, String housingType,
                           BigDecimal desiredAmount, String preferredBank) {
            this(nationality, birthDate, visaType, visaExpiry, residencyStartDate, occupation, employmentType,
                    monthlyIncome, employmentDurationMonths, financialPurpose, language, hasBankAccount,
                    housingType, desiredAmount, preferredBank, null, null, null,
                    null, null, null, null, hasBankAccount, null, null, null);
        }
    }

    public Long getId() { return id; }
    public String getSessionId() { return sessionId; }
    public String getNationality() { return nationality; }
    public LocalDate getBirthDate() { return birthDate; }
    public String getVisaType() { return visaType; }
    public LocalDate getVisaExpiry() { return visaExpiry; }
    public LocalDate getResidencyStartDate() { return residencyStartDate; }
    public String getOccupation() { return occupation; }
    public String getEmploymentType() { return employmentType; }
    public BigDecimal getMonthlyIncome() { return monthlyIncome; }
    public Integer getEmploymentDurationMonths() { return employmentDurationMonths; }
    public String getFinancialPurpose() { return financialPurpose; }
    public String getLanguage() { return language; }
    public Boolean getHasBankAccount() { return hasBankAccount; }
    public String getHousingType() { return housingType; }
    public BigDecimal getDesiredAmount() { return desiredAmount; }
    public String getPreferredBank() { return preferredBank; }
    public ResidentStatus getResidentStatus() { return residentStatus; }
    public Boolean getHasExistingProductAccount() { return hasExistingProductAccount; }
    public BigDecimal getDesiredMonthlyAmount() { return desiredMonthlyAmount; }
    public Boolean getHasResidenceCard() { return hasResidenceCard; }
    public Boolean getHasPassport() { return hasPassport; }
    public Boolean getHasDomesticPhone() { return hasDomesticPhone; }
    public Boolean getCanDomesticPhoneVerify() { return canDomesticPhoneVerify; }
    public Boolean getHasKoreanBankAccount() { return hasKoreanBankAccount == null ? hasBankAccount : hasKoreanBankAccount; }
    public Boolean getHasKoreanCreditHistory() { return hasKoreanCreditHistory; }
    public String getPreferredChannel() { return preferredChannel; }
    public String getRemittanceCountry() { return remittanceCountry; }
    public Instant getExpiresAt() { return expiresAt; }
}
