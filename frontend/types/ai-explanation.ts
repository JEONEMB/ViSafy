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
  language: "ko" | "en" | "vi";
  confirmationItems: string[];
};

export type AiExplanation = {
  eligibilityStatus: EligibilityStatus;
  facts: StructuredExplanationFacts;
  explanation: string;
  disclaimer: string;
  easyTerms: EasyTerm[];
  inquiry?: BankInquiry | null;
  guardrailsApplied: string[];
};
