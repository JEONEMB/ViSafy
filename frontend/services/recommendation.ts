import { apiPost } from "./api-client";
import type { RecommendationResult } from "@/types/recommendation";

export const getRecommendations = (profileSessionId: string) =>
  apiPost<RecommendationResult, { profileSessionId: string }>("/api/recommendations", { profileSessionId });
