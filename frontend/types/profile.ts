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
  birthDate: string;
  visaType: string;
  visaExpiry: string;
  residencyStartDate: string;
  occupation: string;
  employmentType: string;
  monthlyIncome: number;
  employmentDurationMonths: number;
  financialPurpose: string;
  language: string;
  hasBankAccount?: boolean | null;
  housingType?: string | null;
  desiredAmount?: number | null;
  preferredBank?: string | null;
  residentStatus?: "RESIDENT" | "NON_RESIDENT" | "UNKNOWN" | null;
  hasExistingProductAccount?: boolean | null;
  desiredMonthlyAmount?: number | null;
  expiresAt: string;
};

export type TempProfileInput = Omit<TempProfile, "id" | "sessionId" | "expiresAt">;
