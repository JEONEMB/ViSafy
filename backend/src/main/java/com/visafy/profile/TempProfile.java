package com.visafy.profile;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
    @Column(nullable = false)
    private LocalDate birthDate;
    @Column(nullable = false, length = 10)
    private String visaType;
    @Column(nullable = false)
    private LocalDate visaExpiry;
    @Column(nullable = false)
    private LocalDate residencyStartDate;
    @Column(nullable = false, length = 120)
    private String occupation;
    @Column(nullable = false, length = 80)
    private String employmentType;
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal monthlyIncome;
    @Column(nullable = false)
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
        desiredAmount = data.desiredAmount(); preferredBank = data.preferredBank(); updatedAt = Instant.now();
        expiresAt = updatedAt.plusSeconds(24 * 60 * 60);
    }

    public record ProfileData(String nationality, LocalDate birthDate, String visaType, LocalDate visaExpiry,
                              LocalDate residencyStartDate, String occupation, String employmentType,
                              BigDecimal monthlyIncome, Integer employmentDurationMonths, String financialPurpose,
                              String language, Boolean hasBankAccount, String housingType,
                              BigDecimal desiredAmount, String preferredBank) {
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
    public Instant getExpiresAt() { return expiresAt; }
}
