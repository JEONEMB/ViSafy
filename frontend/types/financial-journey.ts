import type { FinancialPurposeCode } from "@/lib/financial-purposes";

export type JourneyStepStatus = "COMPLETED" | "CURRENT" | "UPCOMING" | "NEED_CONFIRMATION";
export type FinancialJourney = {
  purpose: FinancialPurposeCode;
  currentStep: number;
  headline: string;
  nextAction: string;
  profile: {
    nationality: string;
    hasResidenceCard: boolean;
    hasPassport: boolean;
    hasDomesticPhone: boolean;
    canDomesticPhoneVerify: boolean;
    hasKoreanBankAccount: boolean;
    hasKoreanCreditHistory: boolean;
    remittanceCountry?: string | null;
  };
  steps: Array<{ step: number; code: string; status: JourneyStepStatus; title: string; description: string }>;
};
