import type { EligibilityStatus } from "./eligibility";

export type StructuredExplanationFacts = {
  visaType: string;
  visaRemainingMonths: number;
  residencyMonths: number;
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
