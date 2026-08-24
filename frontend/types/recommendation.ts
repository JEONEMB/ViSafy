import type { EligibilityResult, EligibilityStatus } from "./eligibility";
import type { FinancialPurpose, ProductAudience, ProductCategory, ProductType } from "./product";

export type RecommendationItem = {
  productId: number;
  institution: string;
  productName: string;
  productType: ProductType;
  financialPurpose: FinancialPurpose;
  productAudience: ProductAudience;
  productCategory: ProductCategory;
  targetSummary: string;
  requiredDocuments: string;
  applicationMethod: string;
  informationBaseDate: string;
  eligibilityStatus: EligibilityStatus;
  confirmedPublicConditions: number;
  totalPublicConditions: number;
  additionalCheckCount: number;
  unknownCount: number;
  purposeMatched: boolean;
  preferredConditionMatches: number;
  eligibility: EligibilityResult;
};

export type RecommendationResult = {
  recommended: RecommendationItem[];
  additionalInformationNeeded: RecommendationItem[];
  excludedCount: number;
};
