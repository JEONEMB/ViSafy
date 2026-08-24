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
  requiredFields: string[];
  accessAssessment: AccessAssessment;
  disclaimer: string;
};

export type AccessStatus = "ACCESS_READY" | "ACCESS_READY_BRANCH_ONLY" | "ACCESS_READY_ONLINE" | "ACCESS_ADDITIONAL_DOCUMENTS" | "ACCESS_NEED_CONFIRMATION" | "ACCESS_UNKNOWN";
export type AccessAvailability = "AVAILABLE" | "NEED_CONFIRMATION" | "NOT_AVAILABLE" | "UNKNOWN";
export type AccessAssessment = {
  status: AccessStatus;
  identification: AccessAvailability;
  branch: AccessAvailability;
  online: AccessAvailability;
  details: Array<{ category: string; key: string; messageCode: string; message: string; sourceExcerpt?: string | null; sourceLocator?: string | null; sourceUrl?: string | null }>;
  realNameGuardrailApplied: boolean;
};
