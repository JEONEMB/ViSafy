export type EligibilityStatus =
  | "PUBLIC_CONDITIONS_MET"
  | "NEED_BANK_CONFIRMATION"
  | "PUBLIC_CONDITIONS_NOT_MET"
  | "INSUFFICIENT_INFORMATION";

export type EligibilityRuleDetail = {
  ruleId?: number | null;
  key: string;
  messageCode: string;
  message: string;
  actualValue?: string | null;
  expectedValue?: string | null;
  mandatory: boolean;
  blocking: boolean;
  sourceExcerpt?: string | null;
  sourceLocator?: string | null;
  sourceUrl?: string | null;
};

export type EligibilityResult = {
  status: EligibilityStatus;
  productId: number;
  passedRules: EligibilityRuleDetail[];
  failedRules: EligibilityRuleDetail[];
  externalChecks: EligibilityRuleDetail[];
  unknownRules: EligibilityRuleDetail[];
  insufficientReasons: EligibilityRuleDetail[];
  disclaimer: string;
};
