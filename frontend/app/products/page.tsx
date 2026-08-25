"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { RecommendationBoard } from "@/components/recommendation-board";
import { FinancialJourneyPanel, type JourneyFocus } from "@/components/financial-journey-panel";
import { getProducts } from "@/services/product";
import type { DiagnosisStatus, ProductAudience, ProductCategory, ProductFilters } from "@/types/product";
import { toLegacyLocale, type LegacyLocale } from "@/i18n/config";

const copy = {
  ko: { eyebrow: "FR-202 · 금융상품", title: "공식 근거가 있는 금융상품", description: "진단 준비 상태를 확인하고 상품 정보를 비교하세요.", purpose: "금융 목적", type: "상품 유형", bank: "은행 검색", foreigner: "외국인 대상만", status: "진단 가능 여부", all: "전체", account: "계좌", savings: "예·적금", loan: "대출", card: "카드", investment: "투자", checking: "입출금 계좌", ready: "진단 가능", partial: "일부 진단", notReady: "공식 조건 부족", source: "승인 Rule", detail: "상세보기", empty: "조건에 맞는 상품이 없습니다.", baseDate: "정보 기준일", identity: "신분확인", channel: "가입채널", documents: "준비서류", missingPackage: "공식 근거 보완 필요" },
  en: { eyebrow: "FR-202 · Products", title: "Financial products with official sources", description: "Compare product information and check diagnostic readiness.", purpose: "Purpose", type: "Product type", bank: "Search bank", foreigner: "For foreigners only", status: "Readiness", all: "All", account: "Account", savings: "Savings", loan: "Loan", card: "Card", investment: "Investment", checking: "Checking account", ready: "Ready", partial: "Partial", notReady: "Official conditions missing", source: "Approved rules", detail: "View details", empty: "No products match these filters.", baseDate: "Information date", identity: "Identity", channel: "Channel", documents: "Documents", missingPackage: "Official evidence needed" },
  vi: { eyebrow: "FR-202 · Sản phẩm", title: "Sản phẩm tài chính có nguồn chính thức", description: "So sánh thông tin và kiểm tra trạng thái sẵn sàng chẩn đoán.", purpose: "Mục đích", type: "Loại sản phẩm", bank: "Tìm ngân hàng", foreigner: "Chỉ dành cho người nước ngoài", status: "Trạng thái", all: "Tất cả", account: "Tài khoản", savings: "Tiết kiệm", loan: "Khoản vay", card: "Thẻ", investment: "Đầu tư", checking: "Tài khoản thanh toán", ready: "Sẵn sàng", partial: "Một phần", notReady: "Thiếu điều kiện chính thức", source: "Quy tắc đã duyệt", detail: "Xem chi tiết", empty: "Không có sản phẩm phù hợp.", baseDate: "Ngày thông tin", identity: "Danh tính", channel: "Kênh đăng ký", documents: "Giấy tờ", missingPackage: "Cần bổ sung căn cứ chính thức" },
} as const;

const readinessClass: Record<DiagnosisStatus, string> = {
  READY: "border-status-success-border bg-status-success-bg text-status-success",
  PARTIAL: "border-status-warning-border bg-status-warning-bg text-status-warning",
  NOT_READY: "border-status-neutral-border bg-status-neutral-bg text-status-neutral",
};

export default function ProductsPage() {
  const { locale } = useLocale();
  const uiLocale = toLegacyLocale(locale);
  const text = copy[uiLocale];
  const [filters, setFilters] = useState<ProductFilters>({});
  const [journeyFocus, setJourneyFocus] = useState<JourneyFocus>(null);
  const products = useQuery({ queryKey: ["products", filters], queryFn: () => getProducts(filters) });
  const journeyProducts = useQuery({ queryKey: ["products", "journey-all"], queryFn: () => getProducts() });
  const setFilter = (key: keyof ProductFilters, value: string) => setFilters((current) => ({ ...current, [key]: value }));
  const statusLabel = { READY: text.ready, PARTIAL: text.partial, NOT_READY: text.notReady };
  const typeLabel = { CHECKING_ACCOUNT: text.checking, SAVINGS: text.savings, LOAN: text.loan, CARD: text.card, INVESTMENT: text.investment, REMITTANCE: uiLocale === "ko" ? "해외송금" : uiLocale === "vi" ? "Chuyển tiền" : "Remittance" };

  return (
    <main className="ui-page">
      <h1 className="ui-page-heading mt-2">{text.title}</h1>
      <p className="mt-3 max-w-reading text-base leading-7 text-muted">{text.description}</p>

      <RecommendationBoard onContinueJourney={(focus) => setJourneyFocus({ ...focus })} />
      <FinancialJourneyPanel focus={journeyFocus} products={journeyProducts.data} />

      <section className="ui-card mt-8 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5" aria-label="Product filters">
        <label className="ui-label">{text.purpose}<select className="ui-input text-sm" value={filters.financialPurpose ?? ""} onChange={(event) => setFilter("financialPurpose", event.target.value)}><option value="">{text.all}</option><option value="ACCOUNT">{text.account}</option><option value="SAVINGS">{text.savings}</option><option value="LOAN">{text.loan}</option><option value="CARD">{text.card}</option><option value="INVESTMENT">{text.investment}</option></select></label>
        <label className="ui-label">{text.type}<select className="ui-input text-sm" value={filters.productType ?? ""} onChange={(event) => setFilter("productType", event.target.value)}><option value="">{text.all}</option><option value="CHECKING_ACCOUNT">{text.checking}</option><option value="SAVINGS">{text.savings}</option><option value="LOAN">{text.loan}</option><option value="CARD">{text.card}</option><option value="INVESTMENT">{text.investment}</option></select></label>
        <label className="ui-label">{text.bank}<input className="ui-input text-sm" value={filters.institution ?? ""} onChange={(event) => setFilter("institution", event.target.value)} /></label>
        <label className="ui-label">{text.status}<select className="ui-input text-sm" value={filters.diagnosisStatus ?? ""} onChange={(event) => setFilter("diagnosisStatus", event.target.value)}><option value="">{text.all}</option><option value="READY">{text.ready}</option><option value="PARTIAL">{text.partial}</option><option value="NOT_READY">{text.notReady}</option></select></label>
        <label className="flex min-h-12 items-center gap-3 self-end rounded-control border border-line bg-surface-subtle px-4 text-sm font-medium text-ink"><input className="h-5 w-5 accent-brand" type="checkbox" checked={filters.foreignerTarget === "true"} onChange={(event) => setFilter("foreignerTarget", event.target.checked ? "true" : "")} />{text.foreigner}</label>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {products.data?.map((product) => (
          <article className="ui-card flex flex-col p-6 transition duration-200 hover:-translate-y-0.5 hover:border-line-strong" key={product.id}>
            <div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-brand">{product.institution}</p><span className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${readinessClass[product.diagnosisStatus]}`}>{statusLabel[product.diagnosisStatus]}</span></div>
            <div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full border border-line bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-muted">{audienceLabel(uiLocale, product.productAudience)}</span><span className="rounded-full border border-line bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-muted">{categoryLabel(uiLocale, product.productCategory)}</span></div><h2 className="mt-4 text-xl font-bold leading-snug text-ink">{product.productName}</h2>
            <p className="mt-2 text-xs font-medium text-quiet">{typeLabel[product.productType]}</p>
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">{product.targetSummary}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-control bg-surface-subtle p-2"><span className="block text-muted">{text.identity}</span><strong>{product.dataPackage.identityEvidence ? "✓" : "?"}</strong></div><div className="rounded-control bg-surface-subtle p-2"><span className="block text-muted">{text.channel}</span><strong>{product.dataPackage.channelEvidence ? "✓" : "?"}</strong></div><div className="rounded-control bg-surface-subtle p-2"><span className="block text-muted">{text.documents}</span><strong>{product.dataPackage.documentEvidence ? "✓" : "?"}</strong></div></div>
            {product.dataPackage.missingItems.length ? <p className="mt-3 text-xs text-status-warning">{text.missingPackage}: {product.dataPackage.missingItems.length}</p> : null}
            <div className="mt-auto border-t border-line pt-5"><p className="text-xs leading-5 text-quiet">{uiLocale === "ko" ? "공식 조건" : uiLocale === "vi" ? "Điều kiện chính thức" : "Official conditions"} {product.rules.length} · {text.baseDate} {product.informationBaseDate}</p><Link className="ui-link mt-3 inline-flex min-h-11 items-center" href={`/products/${product.id}`}>{text.detail} →</Link></div>
          </article>
        ))}
      </section>
      {products.isLoading ? <p className="mt-12 text-center text-muted" role="status">Loading...</p> : null}
      {products.isError ? <p className="ui-alert-danger mt-12" role="alert">{products.error.message}</p> : null}
      {products.data?.length === 0 ? <p className="mt-12 rounded-card border border-dashed border-line-strong p-10 text-center text-muted">{text.empty}</p> : null}
    </main>
  );
}

function audienceLabel(locale: LegacyLocale, audience: ProductAudience) {
  const labels = {
    ko: { GENERAL: "일반상품", FOREIGNER_SPECIALIZED: "외국인 특화상품", POLICY: "정책금융" },
    en: { GENERAL: "General product", FOREIGNER_SPECIALIZED: "Foreigner-specialized", POLICY: "Policy finance" },
    vi: { GENERAL: "Sản phẩm chung", FOREIGNER_SPECIALIZED: "Dành cho người nước ngoài", POLICY: "Tài chính chính sách" },
  } as const;
  return labels[locale][audience];
}

function categoryLabel(locale: LegacyLocale, category: ProductCategory) {
  const labels: Record<LegacyLocale, Record<ProductCategory, string>> = {
    ko: { DEMAND_DEPOSIT: "입출금계좌", SAVINGS: "적금", TIME_DEPOSIT: "예금", DEBIT_CARD: "체크카드", CREDIT_CARD: "신용카드", PERSONAL_LOAN: "신용대출", HOUSING_LOAN: "주거대출", REMITTANCE: "해외송금", SECURITIES: "증권", POLICY_FINANCE: "정책금융" },
    en: { DEMAND_DEPOSIT: "Demand deposit", SAVINGS: "Savings", TIME_DEPOSIT: "Time deposit", DEBIT_CARD: "Debit card", CREDIT_CARD: "Credit card", PERSONAL_LOAN: "Personal loan", HOUSING_LOAN: "Housing loan", REMITTANCE: "Remittance", SECURITIES: "Securities", POLICY_FINANCE: "Policy finance" },
    vi: { DEMAND_DEPOSIT: "Tài khoản thanh toán", SAVINGS: "Tiết kiệm", TIME_DEPOSIT: "Tiền gửi kỳ hạn", DEBIT_CARD: "Thẻ ghi nợ", CREDIT_CARD: "Thẻ tín dụng", PERSONAL_LOAN: "Vay cá nhân", HOUSING_LOAN: "Vay nhà ở", REMITTANCE: "Chuyển tiền", SECURITIES: "Chứng khoán", POLICY_FINANCE: "Tài chính chính sách" },
  };
  return labels[locale][category];
}
