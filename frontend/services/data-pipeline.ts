import { apiGet, apiPost, apiPut } from "./api-client";
import type { RuleCandidate, RuleChangeHistory, SourceDocument } from "@/types/data-pipeline";

export const getSources = () => apiGet<SourceDocument[]>("/api/admin/sources");
export const createSource = (body: Record<string, unknown>) =>
  apiPost<SourceDocument, Record<string, unknown>>("/api/admin/sources", body);
export const reviewSource = (id: number, reviewStatus: string) =>
  apiPut<SourceDocument, Record<string, unknown>>(`/api/admin/sources/${id}/review`, { reviewStatus });
export const updateSource = (id: number, body: Record<string, unknown>) =>
  apiPut<SourceDocument, Record<string, unknown>>(`/api/admin/sources/${id}`, body);
export const changeSourceStatus = (id: number, status: "ACTIVE" | "EXPIRED" | "NEED_REVIEW" | "SUPERSEDED" | "UNKNOWN") =>
  apiPut<SourceDocument, { status: string }>(`/api/admin/sources/${id}/status`, { status });
export const getRuleCandidates = () => apiGet<RuleCandidate[]>("/api/admin/rule-candidates");
export const createRuleCandidate = (body: Record<string, unknown>) =>
  apiPost<RuleCandidate, Record<string, unknown>>("/api/admin/rule-candidates", body);
export type RuleExtractionResult = {
  proposedCandidates: number;
  savedCandidates: number;
  rejectedUngrounded: number;
  skippedDuplicates: number;
  modelAttempted: boolean;
  savedByModel: number;
  rejectedByVerifier: number;
  warnings: string[];
  candidates: RuleCandidate[];
};
export const extractRuleCandidates = (sourceDocumentId: number, productCode: string) =>
  apiPost<RuleExtractionResult, { sourceDocumentId: number; productCode: string }>(
    "/api/admin/rule-candidates/extract", { sourceDocumentId, productCode });
export const reviewRule = (id: number, body: Record<string, unknown>) =>
  apiPut<RuleCandidate, Record<string, unknown>>(`/api/admin/rules/${id}/review`, body);
export const getRuleHistory = (id: number) =>
  apiGet<RuleChangeHistory[]>(`/api/admin/rules/${id}/history`);
export const reindexRag = () =>
  apiPost<{ indexedDocuments: number; indexedChunks: number; skippedUnlinkedSources: number; skippedUnavailableSnapshots: number }, Record<string, never>>("/api/admin/rag/reindex", {});

export type RagQualityMetrics = {
  approvedEffectiveSources: number;
  indexedEligibleSources: number;
  orphanedApprovedSources: number;
  activeProducts: number;
  diagnosableProducts: number;
  activeEffectiveRules: number;
  evidenceCompleteRules: number;
  evidenceCoveragePercent: number;
  lastIndexedAt: string | null;
  lastReindexResult: { indexedDocuments: number; indexedChunks: number; skippedUnlinkedSources: number; skippedUnavailableSnapshots: number } | null;
};

export const getRagQuality = () => apiGet<RagQualityMetrics>("/api/admin/rag/quality");
