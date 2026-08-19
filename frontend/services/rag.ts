import { apiPost } from "./api-client";
import type { RagAnswer } from "@/types/rag";

export const askOfficialDocuments = (body: {
  profileSessionId: string;
  productId: number;
  ruleKey: string;
  query: string;
  topK: number;
}) => apiPost<RagAnswer, typeof body>("/api/rag/answer", body);
