import type { FinancialPurposeCode } from "@/lib/financial-purposes";

export type JourneyStepStatus = "COMPLETED" | "CURRENT" | "UPCOMING" | "NEED_CONFIRMATION";
export type FinancialJourney = {
  purpose: FinancialPurposeCode;
  currentStep: number;
  headline: string;
  nextAction: string;
  steps: Array<{ step: number; code: string; status: JourneyStepStatus; title: string; description: string }>;
};
