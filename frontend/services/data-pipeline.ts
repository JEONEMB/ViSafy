import { apiGet, apiPost, apiPut } from "./api-client";
import type { RuleCandidate, RuleChangeHistory, SourceDocument } from "@/types/data-pipeline";

export const getSources = () => apiGet<SourceDocument[]>("/api/admin/sources");
export const createSource = (body: Record<string, unknown>) =>
  apiPost<SourceDocument, Record<string, unknown>>("/api/admin/sources", body);
export const reviewSource = (id: number, reviewStatus: string) =>
  apiPut<SourceDocument, Record<string, unknown>>(`/api/admin/sources/${id}/review`, { reviewStatus });
export const updateSource = (id: number, body: Record<string, unknown>) =>
  apiPut<SourceDocument, Record<string, unknown>>(`/api/admin/sources/${id}`, body);
export const changeSourceStatus = (id: number, status: "ACTIVE" | "EXPIRED" | "NEED_REVIEW") =>
  apiPut<SourceDocument, { status: string }>(`/api/admin/sources/${id}/status`, { status });
export const getRuleCandidates = () => apiGet<RuleCandidate[]>("/api/admin/rule-candidates");
export const createRuleCandidate = (body: Record<string, unknown>) =>
  apiPost<RuleCandidate, Record<string, unknown>>("/api/admin/rule-candidates", body);
export const reviewRule = (id: number, body: Record<string, unknown>) =>
  apiPut<RuleCandidate, Record<string, unknown>>(`/api/admin/rules/${id}/review`, body);
export const getRuleHistory = (id: number) =>
  apiGet<RuleChangeHistory[]>(`/api/admin/rules/${id}/history`);
export const reindexRag = () =>
  apiPost<{ indexedDocuments: number; indexedChunks: number; skippedUnlinkedSources: number }, Record<string, never>>("/api/admin/rag/reindex", {});
