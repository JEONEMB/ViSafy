import { apiGet } from "./api-client";
import type { FinancialJourney } from "@/types/financial-journey";

export const getFinancialJourney = (profileSessionId: string) =>
  apiGet<FinancialJourney>(`/api/financial-journey?profileSessionId=${encodeURIComponent(profileSessionId)}`);
