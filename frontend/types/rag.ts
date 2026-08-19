export type RagDocument = {
  documentId: number;
  title: string;
  content: string;
  sourceUrl: string;
  retrievedAt: string;
  score: number;
  institution: string;
  sourceType: string;
  validFrom?: string | null;
  validTo?: string | null;
  productId: number;
  language: string;
};

export type RagAnswer = {
  answer: string;
  eligibilityStatus: string;
  ruleResult: string;
  documents: RagDocument[];
  guardrailsApplied: string[];
};
