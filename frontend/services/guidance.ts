import { apiGet, apiPost } from "./api-client";
import type { ProductDocumentRequirement, ProductGuidance, ProductApplicationStep } from "@/types/guidance";

export const getProductGuidance = (productId: number, language: "ko" | "en" | "vi") =>
  apiGet<ProductGuidance>(`/api/products/${productId}/guidance?language=${language}`);

export const getPersonalizedGuidance = (productId: number, profileSessionId: string) =>
  apiPost<ProductGuidance, { profileSessionId: string }>(`/api/products/${productId}/guidance`, { profileSessionId });

export const createDocumentRequirement = (productId: number, body: Record<string, unknown>) =>
  apiPost<ProductDocumentRequirement, Record<string, unknown>>(`/api/admin/products/${productId}/documents`, body);

export const createApplicationStep = (productId: number, body: Record<string, unknown>) =>
  apiPost<ProductApplicationStep, Record<string, unknown>>(`/api/admin/products/${productId}/steps`, body);
