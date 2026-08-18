import { apiGet } from "./api-client";
import type { HealthStatus } from "@/types/health";

export const getBackendHealth = () => apiGet<HealthStatus>("/api/health");
export const getAiHealth = () => apiGet<HealthStatus>("/api/health/ai");

