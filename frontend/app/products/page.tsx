"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { getProducts } from "@/services/product";
import type { DiagnosisStatus, ProductFilters } from "@/types/product";

const copy = {
  ko: { eyebrow: "FR-202 · 금융상품", title: "공식 근거가 있는 금융상품", description: "진단 준비 상태를 확인하고 상품 정보를 비교하세요.", purpose: "금융 목적", type: "상품 유형", bank: "은행 검색", foreigner: "외국인 대상만", status: "진단 가능 여부", all: "전체", account: "계좌", savings: "예·적금", loan: "대출", card: "카드", checking: "입출금 계좌", ready: "진단 가능", partial: "일부 진단", notReady: "준비 중", source: "승인 Rule", detail: "상세보기", empty: "조건에 맞는 상품이 없습니다.", baseDate: "정보 기준일" },
  en: { eyebrow: "FR-202 · Products", title: "Financial products with official sources", description: "Compare product information and check diagnostic readiness.", purpose: "Purpose", type: "Product type", bank: "Search bank", foreigner: "For foreigners only", status: "Readiness", all: "All", account: "Account", savings: "Savings", loan: "Loan", card: "Card", checking: "Checking account", ready: "Ready", partial: "Partial", notReady: "Not ready", source: "Approved rules", detail: "View details", empty: "No products match these filters.", baseDate: "Information date" },
  vi: { eyebrow: "FR-202 · Sản phẩm", title: "Sản phẩm tài chính có nguồn chính thức", description: "So sánh thông tin và kiểm tra trạng thái sẵn sàng chẩn đoán.", purpose: "Mục đích", type: "Loại sản phẩm", bank: "Tìm ngân hàng", foreigner: "Chỉ dành cho người nước ngoài", status: "Trạng thái", all: "Tất cả", account: "Tài khoản", savings: "Tiết kiệm", loan: "Khoản vay", card: "Thẻ", checking: "Tài khoản thanh toán", ready: "Sẵn sàng", partial: "Một phần", notReady: "Chưa sẵn sàng", source: "Quy tắc đã duyệt", detail: "Xem chi tiết", empty: "Không có sản phẩm phù hợp.", baseDate: "Ngày thông tin" },
} as const;

const readinessClass: Record<DiagnosisStatus, string> = {
  READY: "bg-emerald-100 text-emerald-800",
  PARTIAL: "bg-amber-100 text-amber-800",
  NOT_READY: "bg-slate-200 text-slate-700",
};

export default function ProductsPage() {
  const { locale } = useLocale();
  const text = copy[locale];
  const [filters, setFilters] = useState<ProductFilters>({});
  const products = useQuery({ queryKey: ["products", filters], queryFn: () => getProducts(filters) });
  const setFilter = (key: keyof ProductFilters, value: string) => setFilters((current) => ({ ...current, [key]: value }));
  const statusLabel = { READY: text.ready, PARTIAL: text.partial, NOT_READY: text.notReady };
  const typeLabel = { CHECKING_ACCOUNT: text.checking, SAVINGS: text.savings, LOAN: text.loan, CARD: text.card };

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-sm font-semibold text-blue-700">{text.eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{text.title}</h1>
      <p className="mt-3 text-slate-600">{text.description}</p>

      <section className="mt-8 grid gap-3 rounded-2xl border bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-5" aria-label="Product filters">
        <label className="text-xs font-semibold text-slate-600">{text.purpose}<select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={filters.financialPurpose ?? ""} onChange={(event) => setFilter("financialPurpose", event.target.value)}><option value="">{text.all}</option><option value="ACCOUNT">{text.account}</option><option value="SAVINGS">{text.savings}</option><option value="LOAN">{text.loan}</option><option value="CARD">{text.card}</option></select></label>
        <label className="text-xs font-semibold text-slate-600">{text.type}<select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={filters.productType ?? ""} onChange={(event) => setFilter("productType", event.target.value)}><option value="">{text.all}</option><option value="CHECKING_ACCOUNT">{text.checking}</option><option value="SAVINGS">{text.savings}</option><option value="LOAN">{text.loan}</option><option value="CARD">{text.card}</option></select></label>
        <label className="text-xs font-semibold text-slate-600">{text.bank}<input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={filters.institution ?? ""} onChange={(event) => setFilter("institution", event.target.value)} /></label>
        <label className="text-xs font-semibold text-slate-600">{text.status}<select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={filters.diagnosisStatus ?? ""} onChange={(event) => setFilter("diagnosisStatus", event.target.value)}><option value="">{text.all}</option><option value="READY">{text.ready}</option><option value="PARTIAL">{text.partial}</option><option value="NOT_READY">{text.notReady}</option></select></label>
        <label className="flex items-center gap-2 self-end rounded-lg bg-slate-50 px-3 py-2.5 text-sm"><input type="checkbox" checked={filters.foreignerTarget === "true"} onChange={(event) => setFilter("foreignerTarget", event.target.checked ? "true" : "")} />{text.foreigner}</label>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {products.data?.map((product) => (
          <article className="flex min-h-72 flex-col rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg" key={product.id}>
            <div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-blue-700">{product.institution}</p><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${readinessClass[product.diagnosisStatus]}`}>{statusLabel[product.diagnosisStatus]}</span></div>
            <h2 className="mt-4 text-xl font-bold">{product.productName}</h2>
            <p className="mt-2 text-xs font-medium text-slate-400">{typeLabel[product.productType]}</p>
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{product.targetSummary}</p>
            <div className="mt-auto pt-6"><p className="text-xs text-slate-400">{text.source} {product.rules.length} · {text.baseDate} {product.informationBaseDate}</p><Link className="mt-3 inline-flex font-semibold text-blue-700" href={`/products/${product.id}`}>{text.detail} →</Link></div>
          </article>
        ))}
      </section>
      {products.isLoading ? <p className="mt-12 text-center text-slate-500">Loading...</p> : null}
      {products.isError ? <p className="mt-12 rounded-xl bg-rose-100 p-5 text-rose-800">{products.error.message}</p> : null}
      {products.data?.length === 0 ? <p className="mt-12 rounded-xl border border-dashed p-10 text-center text-slate-500">{text.empty}</p> : null}
    </main>
  );
}
