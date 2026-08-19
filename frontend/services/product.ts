import { apiGet, apiPost, apiPut } from "./api-client";
import type { FinancialProduct, ProductFilters } from "@/types/product";

export function getProducts(filters: ProductFilters = {}) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const suffix = query.size ? `?${query.toString()}` : "";
  return apiGet<FinancialProduct[]>(`/api/products${suffix}`);
}

export const getProduct = (id: number) => apiGet<FinancialProduct>(`/api/products/${id}`);
export const getAdminProducts = () => apiGet<FinancialProduct[]>("/api/admin/products");
export const createProduct = (body: Record<string, unknown>) =>
  apiPost<FinancialProduct, Record<string, unknown>>("/api/admin/products", body);
export const updateProduct = (id: number, body: Record<string, unknown>) =>
  apiPut<FinancialProduct, Record<string, unknown>>(`/api/admin/products/${id}`, body);
export const deactivateProduct = (id: number) =>
  apiPut<FinancialProduct, Record<string, never>>(`/api/admin/products/${id}/deactivate`, {});
