import type { EligibilityStatus } from "./eligibility";

export type StructuredExplanationFacts = {
  visaType: string | null;
  visaRemainingMonths: number | null;
  residencyMonths: number | null;
  passedCount: number;
  failedCount: number;
  externalCheckCount: number;
  unknownCount: number;
};

export type EasyTerm = {
  key: string;
  koreanTerm: string;
  localizedTerm: string;
  explanation: string;
};

export type BankInquiry = {
  korean: string;
  localized: string;
  language: "ko" | "en" | "vi" | "zh" | "ja" | "th";
  confirmationItems: string[];
};

export type AiExplanation = {
  eligibilityStatus: EligibilityStatus;
  accessStatus: string;
  facts: StructuredExplanationFacts;
  explanation: string;
  nextActions: string[];
  disclaimer: string;
  easyTerms: EasyTerm[];
  inquiry?: BankInquiry | null;
  guardrailsApplied: string[];
};
