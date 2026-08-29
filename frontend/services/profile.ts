import { apiGet, apiPost, apiPut } from "./api-client";
import type { TempProfile, TempProfileInput, VisaMaster } from "@/types/profile";

export const getVisas = () => apiGet<VisaMaster[]>("/api/visas");
export const createProfile = (body: Record<string, unknown>) =>
  apiPost<TempProfile, Record<string, unknown>>("/api/profiles", body);
export const getProfile = (id: number, sessionId: string) =>
  apiGet<TempProfile>(`/api/profiles/${id}`, { "X-Profile-Session-Id": sessionId });
export const updateProfile = (id: number, sessionId: string, body: TempProfileInput) =>
  apiPut<TempProfile, TempProfileInput>(`/api/profiles/${id}`, body, { "X-Profile-Session-Id": sessionId });
export const updateProfileLanguage = (id: number, sessionId: string, language: string) =>
  apiPut<TempProfile, { language: string }>(`/api/profiles/${id}/language`, { language }, { "X-Profile-Session-Id": sessionId });
