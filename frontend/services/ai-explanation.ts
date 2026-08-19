import { apiPost } from "./api-client";
import type { AiExplanation } from "@/types/ai-explanation";

export const getAiExplanation = (body: { profileSessionId: string; productId: number }) =>
  apiPost<AiExplanation, typeof body>("/api/ai/explanation", body);
