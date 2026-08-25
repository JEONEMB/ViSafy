"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { toLegacyLocale } from "@/i18n/config";
import type { ProductDocumentRequirement, ProductGuidance } from "@/types/guidance";

const copy = {
  ko: { eyebrow: "FR-501 · FR-502 · FR-601 · FR-602", title: "필요서류와 신청절차", description: "승인된 공식 Source에서 확인된 정보만 구분해 표시합니다.", personalized: "내 프로필에 맞춰 조건부 서류를 정리했습니다.", official: "공식적으로 명시된 필수서류", conditional: "상황에 따라 필요한 서류", bank: "은행 확인이 필요한 서류", steps: "공식 신청절차", step: "STEP", source: "공식 근거", condition: "적용 Rule", empty: "등록된 항목이 없습니다.", noGuidance: "아직 구조화된 공식 서류·신청절차가 등록되지 않았습니다. 아래 공식 출처에서 최신 정보를 확인해 주세요.", excluded: "현재 프로필에 적용되지 않는 조건부 서류", items: "개 제외", channel: "신청 채널" },
  en: { eyebrow: "FR-501 · FR-502 · FR-601 · FR-602", title: "Document checklist and application process", description: "Only information confirmed by approved official Sources is categorized and shown.", personalized: "Conditional documents have been filtered for your profile.", official: "Officially required documents", conditional: "Documents required depending on your situation", bank: "Documents requiring bank confirmation", steps: "Official application process", step: "STEP", source: "Official evidence", condition: "Applicable Rule", empty: "No items are registered.", noGuidance: "Structured official documents and application steps have not been registered yet. Check the official source below for current information.", excluded: "Conditional documents not applicable to this profile", items: "excluded", channel: "Application channel" },
  vi: { eyebrow: "FR-501 · FR-502 · FR-601 · FR-602", title: "Danh sách giấy tờ và quy trình đăng ký", description: "Chỉ phân loại và hiển thị thông tin được xác nhận bởi nguồn chính thức đã duyệt.", personalized: "Giấy tờ có điều kiện đã được lọc theo hồ sơ của bạn.", official: "Giấy tờ bắt buộc được nêu chính thức", conditional: "Giấy tờ cần tùy theo trường hợp", bank: "Giấy tờ cần ngân hàng xác nhận", steps: "Quy trình đăng ký chính thức", step: "BƯỚC", source: "Căn cứ chính thức", condition: "Rule áp dụng", empty: "Chưa có mục nào được đăng ký.", noGuidance: "Chưa đăng ký giấy tờ và quy trình chính thức có cấu trúc. Hãy kiểm tra nguồn chính thức bên dưới để biết thông tin mới nhất.", excluded: "Giấy tờ có điều kiện không áp dụng cho hồ sơ này", items: "mục được loại trừ", channel: "Kênh đăng ký" },
} as const;

export function ProductGuidancePanel({ guidance, sourceUrl, loading, view = "all" }: { guidance?: ProductGuidance; sourceUrl: string; loading: boolean; view?: "all" | "documents" | "steps" }) {
  const { locale } = useLocale();
  const text = copy[toLegacyLocale(locale)];
  if (loading) return <section className="ui-card mt-8 animate-pulse p-7"><div className="h-6 w-60 rounded bg-line" /><div className="mt-5 h-36 rounded bg-surface-subtle" /></section>;
  const documentTotal = guidance ? guidance.officialRequired.length + guidance.conditional.length + guidance.bankConfirmation.length : 0;
  const total = guidance ? (view === "documents" ? documentTotal : view === "steps" ? guidance.applicationSteps.length : documentTotal + guidance.applicationSteps.length) : 0;
  return <section className="mt-8 overflow-hidden rounded-panel border border-line bg-surface">
    <header className="border-b border-line bg-surface-subtle p-6 sm:p-8"><h2 className="text-2xl font-bold text-ink">{text.title}</h2><p className="mt-2 text-sm leading-6 text-muted">{text.description}</p>{guidance?.personalized ? <p className="ui-alert-info mt-4">{text.personalized}</p> : null}</header>
    <div className="space-y-8 p-7 sm:p-8">
      {!guidance || total === 0 ? <p className="ui-alert-warning">{text.noGuidance} <a className="ui-link" href={sourceUrl} rel="noreferrer" target="_blank">{text.source} →</a></p> : <>
        {view !== "steps" ? <><div className="grid gap-4 lg:grid-cols-3"><ChecklistGroup icon="✓" title={text.official} items={guidance.officialRequired} sourceLabel={text.source} empty={text.empty} tone="emerald" /><ChecklistGroup icon="○" title={text.conditional} items={guidance.conditional} sourceLabel={text.source} empty={text.empty} tone="amber" /><ChecklistGroup icon="⚠" title={text.bank} items={guidance.bankConfirmation} sourceLabel={text.source} empty={text.empty} tone="rose" /></div>{guidance.personalized && guidance.excludedConditionalCount > 0 ? <p className="text-xs text-slate-500">{text.excluded}: {guidance.excludedConditionalCount}{locale === "ko" ? text.items : ` ${text.items}`}</p> : null}</> : null}
        {view !== "documents" ? <section><h3 className="text-lg font-bold text-ink">{text.steps}</h3>{guidance.applicationSteps.length === 0 ? <p className="mt-3 text-sm text-muted">{text.empty}</p> : <ol className="mt-4 grid gap-3">{guidance.applicationSteps.map((step) => <li className="grid gap-3 rounded-card border border-line p-5 sm:grid-cols-[76px_1fr]" key={step.id}><div className="text-sm font-bold text-brand">{text.step} {step.stepOrder}</div><div><h4 className="font-bold text-ink">{step.title}</h4><p className="mt-2 text-sm leading-6 text-muted">{step.description}</p>{step.channel ? <p className="mt-2 text-xs text-muted">{text.channel}: {step.channel}</p> : null}<a className="ui-link mt-3 inline-flex text-xs" href={step.sourceUrl} rel="noreferrer" target="_blank">{text.source} · {step.sourceLocator} ↗</a></div></li>)}</ol>}</section> : null}
      </>}
      {guidance ? <p className="rounded-card border border-line bg-surface-subtle p-4 text-xs leading-5 text-muted">{guidance.disclaimer}</p> : null}
    </div>
  </section>;
}

const tones = { emerald: "border-status-success-border bg-status-success-bg", amber: "border-status-warning-border bg-status-warning-bg", rose: "border-status-neutral-border bg-status-neutral-bg" } as const;

function ChecklistGroup({ icon, title, items, sourceLabel, empty, tone }: { icon: string; title: string; items: ProductDocumentRequirement[]; sourceLabel: string; empty: string; tone: keyof typeof tones }) {
  return <section className={`rounded-card border p-5 ${tones[tone]}`}><div className="flex items-start gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full border border-current text-sm font-bold" aria-hidden>{icon}</span><h3 className="font-bold leading-6 text-ink">{title}</h3></div>{items.length === 0 ? <p className="mt-4 text-sm text-muted">{empty}</p> : <ul className="mt-4 space-y-3">{items.map((item) => <li className="rounded-control border border-line bg-surface p-4" key={item.id}><p className="font-semibold text-ink">{item.documentName}</p>{item.description ? <p className="mt-1 text-sm leading-5 text-muted">{item.description}</p> : null}<a className="ui-link mt-2 inline-flex text-xs" href={item.sourceUrl} rel="noreferrer" target="_blank">{sourceLabel} · {item.sourceLocator} ↗</a></li>)}</ul>}</section>;
}
