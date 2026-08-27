import { apiGet, apiPost } from "./api-client";
import type { ConsultationHistoryItem, ConsultationResponse } from "@/types/consultation";

export const getConsultationHistory = (profileSessionId: string, productId: number) =>
  apiGet<ConsultationHistoryItem[]>(`/api/ai/chat/history?profileSessionId=${encodeURIComponent(profileSessionId)}&productId=${productId}`);
export const askConsultation = (body: { profileSessionId: string; productId: number; ruleKey: string; query: string; topK: number }) =>
  apiPost<ConsultationResponse, typeof body>("/api/ai/chat", body);
