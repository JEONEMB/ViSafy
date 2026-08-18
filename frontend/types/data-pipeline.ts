export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "NEED_REVIEW" | "EXPIRED";
export type SourceType = "PRODUCT_PAGE" | "PRODUCT_DESCRIPTION" | "TERMS" | "FAQ" | "PUBLIC_GUIDE";
export type RuleLevel = "HARD" | "EXTERNAL_CHECK" | "UNKNOWN";

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
  reviewStatus: ReviewStatus;
  lastVerifiedAt: string;
};

export type RuleCandidate = {
  id: number;
  sourceDocumentId: number;
  sourceTitle: string;
  productCode: string;
  ruleKey: string;
  operator: string;
  ruleValue: string;
  ruleLevel: RuleLevel;
  sourceExcerpt: string;
  confidence: number;
  reviewStatus: ReviewStatus;
  lastVerifiedAt?: string;
};

