import type { EligibilityResult, EligibilityStatus } from "./eligibility";
import type { FinancialPurpose, ProductType } from "./product";

export type RecommendationItem = {
  productId: number;
  institution: string;
  productName: string;
  productType: ProductType;
  financialPurpose: FinancialPurpose;
  targetSummary: string;
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
