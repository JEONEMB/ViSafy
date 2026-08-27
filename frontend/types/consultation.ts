import type { RagDocument } from "./rag";

export type ConsultationHistoryItem = { id: string; question: string; answer: string; ruleKey: string; language: string; createdAt: string };
export type ConsultationResponse = ConsultationHistoryItem & { eligibilityStatus: string; ruleResult: string; documents: RagDocument[]; guardrailsApplied: string[] };
