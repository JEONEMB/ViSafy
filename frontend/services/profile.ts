import { apiGet, apiPost } from "./api-client";
import type { TempProfile, VisaMaster } from "@/types/profile";

export const getVisas = () => apiGet<VisaMaster[]>("/api/visas");
export const createProfile = (body: Record<string, unknown>) =>
  apiPost<TempProfile, Record<string, unknown>>("/api/profiles", body);

