export type ProductType = "CHECKING_ACCOUNT" | "SAVINGS" | "LOAN" | "CARD" | "INVESTMENT" | "REMITTANCE";
export type FinancialPurpose = "ACCOUNT" | "SAVINGS" | "LOAN" | "CARD" | "INVESTMENT";
export type DiagnosisStatus = "READY" | "PARTIAL" | "NOT_READY";
export type ProductAudience = "GENERAL" | "FOREIGNER_SPECIALIZED" | "POLICY";
export type ProductCategory = "DEMAND_DEPOSIT" | "SAVINGS" | "TIME_DEPOSIT" | "DEBIT_CARD" | "CREDIT_CARD" | "PERSONAL_LOAN" | "HOUSING_LOAN" | "REMITTANCE" | "SECURITIES" | "POLICY_FINANCE";

export type ProductRule = {
  id: number;
  productId: number;
  ruleKey: string;
  operator: "EQ" | "NE" | "GT" | "GTE" | "LT" | "LTE" | "IN" | "NOT_IN" | "EXISTS";
  ruleValue: string;
  ruleLevel: "HARD" | "EXTERNAL_CHECK" | "UNKNOWN";
  ruleNature: "HARD_ELIGIBILITY" | "REQUIRED_DOCUMENT" | "IDENTIFICATION_METHOD" | "CHANNEL_REQUIREMENT" | "BENEFIT_CONDITION" | "EXTERNAL_CHECK" | "UNKNOWN_ELIGIBILITY" | "INFORMATION";
  mandatory: boolean;
  sourceDocumentId: number;
  sourceLocator: string;
  pageNumber?: number | null;
  sectionName?: string | null;
  validFrom?: string | null;
  validTo?: string | null;
  reviewStatus: "APPROVED";
  verifiedAt: string;
  reviewedBy?: string | null;
  description: string;
  sourceExcerpt: string;
  evidence: {
    ruleId: number;
    sourceDocumentId: number;
    sourceExcerpt: string;
    sourceLocator: string;
    pageNumber?: number | null;
    sectionName?: string | null;
    verifiedAt: string;
    reviewedBy?: string | null;
  };
};

export type FinancialProduct = {
  id: number;
  productCode: string;
  institution: string;
  productName: string;
  productType: ProductType;
  financialPurpose: FinancialPurpose;
  productAudience: ProductAudience;
  productCategory: ProductCategory;
  description: string;
  targetSummary: string;
  active: boolean;
  foreignerTarget: boolean;
  informationBaseDate: string;
  publicConditions: string;
  additionalConditions: string;
  requiredDocuments: string;
  applicationMethod: string;
  officialApplicationUrl?: string | null;
  diagnosisStatus: DiagnosisStatus;
  sourceDocumentId: number;
  sourceTitle: string;
  sourceUrl: string;
  updatedAt: string;
  rules: ProductRule[];
  requiredFields: string[];
  dataPackage: { productPage: boolean; termsOrDescription: boolean; hardRuleEvidence: boolean; identityEvidence: boolean; channelEvidence: boolean; documentEvidence: boolean; applicationStepEvidence: boolean; informationBaseDate: boolean; missingItems: string[]; complete: boolean };
  diagnosisReasonCode: "APPROVED_HARD_RULES_AVAILABLE" | "ADDITIONAL_CONFIRMATION_REQUIRED" | "SOURCE_INSUFFICIENT";
  sourceTrust: { freshnessStatus: "FRESH" | "REVIEW_SOON" | "STALE"; lastVerifiedAt: string; validTo?: string | null; evidenceCoveragePercent: number; ragEligible: boolean; officialContentChanged: boolean; officialContentChangedAt?: string | null };
};

export type ProductFilters = {
  financialPurpose?: string;
  productType?: string;
  institution?: string;
  foreignerTarget?: string;
  diagnosisStatus?: string;
};
