import { apiPost } from "./api-client";
import type { EligibilityResult } from "@/types/eligibility";

export const precheckEligibility = (body: { profileSessionId: string; productId: number }) =>
  apiPost<EligibilityResult, typeof body>("/api/eligibility/pre-check", body);
