export type DocumentRequirementType = "OFFICIAL_REQUIRED" | "CONDITIONAL" | "BANK_CONFIRMATION";

export type ProductDocumentRequirement = {
  id: number;
  documentName: string;
  description?: string | null;
  requirementType: DocumentRequirementType;
  conditionRuleKey?: string | null;
  sourceTitle: string;
  sourceUrl: string;
  sourceLocator: string;
};

export type ProductApplicationStep = {
  id: number;
  stepOrder: number;
  title: string;
  description: string;
  channel?: string | null;
  sourceTitle: string;
  sourceUrl: string;
  sourceLocator: string;
};

export type ProductGuidance = {
  productId: number;
  personalized: boolean;
  officialRequired: ProductDocumentRequirement[];
  conditional: ProductDocumentRequirement[];
  bankConfirmation: ProductDocumentRequirement[];
  applicationSteps: ProductApplicationStep[];
  excludedConditionalCount: number;
  disclaimer: string;
};
