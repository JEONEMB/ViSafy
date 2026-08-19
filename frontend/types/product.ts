export type ProductType = "CHECKING_ACCOUNT" | "SAVINGS" | "LOAN" | "CARD";
export type FinancialPurpose = "ACCOUNT" | "SAVINGS" | "LOAN" | "CARD";
export type DiagnosisStatus = "READY" | "PARTIAL" | "NOT_READY";

export type ProductRule = {
  id: number;
  productId: number;
  ruleKey: string;
  operator: "EQ" | "NE" | "GT" | "GTE" | "LT" | "LTE" | "IN" | "NOT_IN" | "EXISTS";
  ruleValue: string;
  ruleLevel: "HARD" | "EXTERNAL_CHECK" | "UNKNOWN";
  mandatory: boolean;
  sourceDocumentId: number;
  sourceLocator: string;
  validFrom?: string | null;
  validTo?: string | null;
  reviewStatus: "APPROVED";
  verifiedAt: string;
  description: string;
  sourceExcerpt: string;
};

export type FinancialProduct = {
  id: number;
  productCode: string;
  institution: string;
  productName: string;
  productType: ProductType;
  financialPurpose: FinancialPurpose;
  description: string;
  targetSummary: string;
  active: boolean;
  foreignerTarget: boolean;
  informationBaseDate: string;
  publicConditions: string;
  additionalConditions: string;
  requiredDocuments: string;
  applicationMethod: string;
  diagnosisStatus: DiagnosisStatus;
  sourceDocumentId: number;
  sourceTitle: string;
  sourceUrl: string;
  rules: ProductRule[];
};

export type ProductFilters = {
  financialPurpose?: string;
  productType?: string;
  institution?: string;
  foreignerTarget?: string;
  diagnosisStatus?: string;
};
