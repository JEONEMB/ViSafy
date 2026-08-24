export type VisaMaster = {
  visaCode: string;
  visaName: string;
  visaCategory: string;
  description: string;
  active: boolean;
};

export type TempProfile = {
  id: number;
  sessionId: string;
  nationality: string;
  birthDate: string | null;
  visaType: string | null;
  visaExpiry: string | null;
  residencyStartDate: string | null;
  occupation: string | null;
  employmentType: string | null;
  monthlyIncome: number | null;
  employmentDurationMonths: number | null;
  financialPurpose: string;
  language: string;
  hasBankAccount?: boolean | null;
  housingType?: string | null;
  desiredAmount?: number | null;
  preferredBank?: string | null;
  residentStatus?: "RESIDENT" | "NON_RESIDENT" | "UNKNOWN" | null;
  hasExistingProductAccount?: boolean | null;
  desiredMonthlyAmount?: number | null;
  hasResidenceCard?: boolean | null;
  hasPassport?: boolean | null;
  hasDomesticPhone?: boolean | null;
  canDomesticPhoneVerify?: boolean | null;
  hasKoreanBankAccount?: boolean | null;
  hasKoreanCreditHistory?: boolean | null;
  preferredChannel?: string | null;
  remittanceCountry?: string | null;
  expiresAt: string;
};

export type TempProfileInput = Omit<TempProfile, "id" | "sessionId" | "expiresAt">;
