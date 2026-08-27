import { apiGet, apiPut } from "./api-client";
import type { FinancialJourney } from "@/types/financial-journey";

export const getFinancialJourney = (profileSessionId: string) =>
  apiGet<FinancialJourney>(`/api/financial-journey?profileSessionId=${encodeURIComponent(profileSessionId)}`);
export const updateJourneyProgress = (profileSessionId: string, stepCode: string, completed: boolean) =>
  apiPut<FinancialJourney, { profileSessionId: string; completed: boolean }>(`/api/financial-journey/progress/${stepCode}`, { profileSessionId, completed });
