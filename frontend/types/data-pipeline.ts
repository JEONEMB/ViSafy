export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "NEED_REVIEW" | "EXPIRED";
export type SourceType = "PRODUCT_PAGE" | "PRODUCT_DESCRIPTION" | "TERMS" | "FAQ" | "PUBLIC_GUIDE";
export type RuleLevel = "HARD" | "EXTERNAL_CHECK" | "UNKNOWN";
export type RuleOperator = "EQ" | "NE" | "GT" | "GTE" | "LT" | "LTE" | "IN" | "NOT_IN" | "EXISTS";

export type SourceDocument = {
  id: number;
  institution: string;
  sourceType: SourceType;
  title: string;
  sourceUrl: string;
  snapshotText: string;
  contentHash: string;
  retrievedAt: string;
  validFrom?: string;
  validTo?: string;
  language: "ko" | "en" | "vi";
  reviewStatus: ReviewStatus;
  lastVerifiedAt: string;
};

export type RuleCandidate = {
  id: number;
  sourceDocumentId: number;
  sourceTitle: string;
  productCode: string;
  ruleKey: string;
  operator: RuleOperator;
  ruleValue: string;
  ruleLevel: RuleLevel;
  mandatory: boolean;
  sourceExcerpt: string;
  sourceLocator: string;
  validFrom?: string | null;
  validTo?: string | null;
  description: string;
  confidence: number;
  reviewStatus: ReviewStatus;
  lastVerifiedAt?: string;
};
