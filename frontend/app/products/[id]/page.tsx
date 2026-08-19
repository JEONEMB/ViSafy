"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { AiExplanationPanel } from "@/components/ai-explanation-panel";
import { ProductGuidancePanel } from "@/components/product-guidance-panel";
import { precheckEligibility } from "@/services/eligibility";
import { getAiExplanation } from "@/services/ai-explanation";
import { getPersonalizedGuidance, getProductGuidance } from "@/services/guidance";
import { getProduct } from "@/services/product";
import { RagQuestionPanel } from "@/components/rag-question-panel";
import type { EligibilityResult, EligibilityRuleDetail, EligibilityStatus } from "@/types/eligibility";

const copy = {
  ko: { back: "상품 목록", summary: "상품 요약", public: "공개조건", additional: "추가 확인 조건", documents: "필요서류", apply: "신청방법", source: "공식 출처", base: "정보 기준일", rules: "검수된 조건", required: "필수", optional: "선택", locator: "근거 위치", validity: "유효기간", noLimit: "제한 없음", noRules: "현재 유효한 승인 Rule이 없습니다.", precheckTitle: "내 프로필로 사전자격 확인", precheckDescription: "공개된 조건과 저장한 임시 프로필을 비교합니다.", precheckButton: "사전자격 진단하기", checking: "조건 확인 중...", noProfile: "진단에 사용할 임시 프로필이 없거나 만료되었습니다.", precheckError: "진단 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.", createProfile: "프로필 입력하기", retry: "다시 진단", passed: "충족한 조건", failed: "충족하지 못한 조건", external: "은행 확인 조건", unknown: "공개되지 않은 조건", insufficient: "정보가 부족한 조건", evidence: "공식 근거", emptySection: "해당 조건이 없습니다.", status: { PUBLIC_CONDITIONS_MET: "공개조건 충족", NEED_BANK_CONFIRMATION: "은행 확인 필요", PUBLIC_CONDITIONS_NOT_MET: "공개조건 미충족", INSUFFICIENT_INFORMATION: "정보 부족" }, warning: "공개된 조건을 기반으로 한 사전 확인이며 최종 가입승인이 아닙니다. 최종 결정은 은행 심사에서 이루어집니다." },
  en: { back: "Products", summary: "Product summary", public: "Public conditions", additional: "Additional checks", documents: "Required documents", apply: "How to apply", source: "Official source", base: "Information date", rules: "Reviewed conditions", required: "Required", optional: "Optional", locator: "Source location", validity: "Valid period", noLimit: "No limit", noRules: "There are no currently effective approved rules.", precheckTitle: "Check with my profile", precheckDescription: "Compare public conditions with your saved temporary profile.", precheckButton: "Run eligibility pre-check", checking: "Checking conditions...", noProfile: "Your temporary profile is missing or has expired.", precheckError: "The pre-check could not be completed. Please try again shortly.", createProfile: "Create profile", retry: "Check again", passed: "Conditions met", failed: "Conditions not met", external: "Bank confirmation", unknown: "Unpublished conditions", insufficient: "Insufficient information", evidence: "Official evidence", emptySection: "No conditions in this category.", status: { PUBLIC_CONDITIONS_MET: "Public conditions met", NEED_BANK_CONFIRMATION: "Bank confirmation needed", PUBLIC_CONDITIONS_NOT_MET: "Public conditions not met", INSUFFICIENT_INFORMATION: "Insufficient information" }, warning: "This is a preliminary check based only on public conditions, not final approval. The bank makes the final decision." },
  vi: { back: "Danh sách sản phẩm", summary: "Tóm tắt sản phẩm", public: "Điều kiện công khai", additional: "Điều kiện cần xác nhận", documents: "Giấy tờ cần thiết", apply: "Cách đăng ký", source: "Nguồn chính thức", base: "Ngày thông tin", rules: "Điều kiện đã kiểm duyệt", required: "Bắt buộc", optional: "Tùy chọn", locator: "Vị trí nguồn", validity: "Thời hạn hiệu lực", noLimit: "Không giới hạn", noRules: "Không có quy tắc đã duyệt nào đang có hiệu lực.", precheckTitle: "Kiểm tra bằng hồ sơ của tôi", precheckDescription: "So sánh điều kiện công khai với hồ sơ tạm thời đã lưu.", precheckButton: "Kiểm tra điều kiện", checking: "Đang kiểm tra điều kiện...", noProfile: "Hồ sơ tạm thời không tồn tại hoặc đã hết hạn.", precheckError: "Không thể hoàn tất kiểm tra. Vui lòng thử lại sau.", createProfile: "Nhập hồ sơ", retry: "Kiểm tra lại", passed: "Điều kiện đã đáp ứng", failed: "Điều kiện chưa đáp ứng", external: "Cần ngân hàng xác nhận", unknown: "Điều kiện không công khai", insufficient: "Thông tin chưa đầy đủ", evidence: "Căn cứ chính thức", emptySection: "Không có điều kiện thuộc nhóm này.", status: { PUBLIC_CONDITIONS_MET: "Đáp ứng điều kiện công khai", NEED_BANK_CONFIRMATION: "Cần ngân hàng xác nhận", PUBLIC_CONDITIONS_NOT_MET: "Không đáp ứng điều kiện công khai", INSUFFICIENT_INFORMATION: "Thiếu thông tin" }, warning: "Đây chỉ là kiểm tra sơ bộ dựa trên điều kiện công khai, không phải phê duyệt cuối cùng. Ngân hàng đưa ra quyết định cuối cùng." },
} as const;

const levelStyle = {
  HARD: "bg-emerald-100 text-emerald-800",
  EXTERNAL_CHECK: "bg-amber-100 text-amber-900",
  UNKNOWN: "bg-slate-200 text-slate-700",
} as const;

const resultStyle: Record<EligibilityStatus, string> = {
  PUBLIC_CONDITIONS_MET: "border-emerald-200 bg-emerald-50 text-emerald-950",
  NEED_BANK_CONFIRMATION: "border-amber-200 bg-amber-50 text-amber-950",
  PUBLIC_CONDITIONS_NOT_MET: "border-rose-200 bg-rose-50 text-rose-950",
  INSUFFICIENT_INFORMATION: "border-slate-300 bg-slate-100 text-slate-900",
};

function LegacyProductDetailPage() {
  const { locale } = useLocale();
  const text = copy[locale];
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const product = useQuery({ queryKey: ["product", id], queryFn: () => getProduct(id), enabled: Number.isFinite(id) });
  const guidance = useQuery({ queryKey: ["product-guidance", id, locale], queryFn: () => getProductGuidance(id, locale), enabled: Number.isFinite(id) });
  const [missingProfile, setMissingProfile] = useState(false);
  const precheck = useMutation({
    mutationFn: precheckEligibility,
    onError: (error: Error) => setMissingProfile(/profile|expired/i.test(error.message)),
  });
  const explanation = useMutation({ mutationFn: getAiExplanation });
  const personalizedGuidance = useMutation({ mutationFn: ({ productId, profileSessionId }: { productId: number; profileSessionId: string }) => getPersonalizedGuidance(productId, profileSessionId) });

  function runPrecheck() {
    const profileSessionId = localStorage.getItem("visafyProfileSessionId");
    if (!profileSessionId) {
      setMissingProfile(true);
      return;
    }
    setMissingProfile(false);
    explanation.reset();
    personalizedGuidance.reset();
    const request = { profileSessionId, productId: id };
    precheck.mutate(request, { onSuccess: () => {
      explanation.mutate(request);
      personalizedGuidance.mutate(request);
    } });
  }

  if (product.isLoading) return <main className="mx-auto max-w-4xl px-6 py-12">Loading...</main>;
  if (product.isError || !product.data) return <main className="mx-auto max-w-4xl px-6 py-12 text-rose-700">{product.error?.message ?? "Product not found"}</main>;
  const item = product.data;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link className="text-sm font-semibold text-blue-700" href="/products">← {text.back}</Link>
      <header className="mt-6 rounded-3xl bg-slate-950 p-8 text-white sm:p-10">
        <div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{item.diagnosisStatus}</span><span className="text-sm text-slate-300">{item.institution}</span></div>
        <h1 className="mt-5 text-3xl font-bold sm:text-4xl">{item.productName}</h1>
        <p className="mt-4 max-w-2xl leading-7 text-slate-300">{item.description}</p>
      </header>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Info title={text.summary} body={item.targetSummary} />
        <Info title={text.public} body={item.publicConditions} />
        <Info title={text.additional} body={item.additionalConditions} />
        <section className="rounded-2xl border bg-white p-6"><h2 className="font-bold">{text.source}</h2><a className="mt-3 block text-sm font-semibold text-blue-700 underline" href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceTitle}</a><p className="mt-3 text-sm text-slate-500">{text.base}: {item.informationBaseDate}</p></section>
      </div>

      <section className="mt-8 overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl">
        <div className="grid gap-6 p-7 sm:grid-cols-[1fr_auto] sm:items-center sm:p-9">
          <div><p className="text-sm font-semibold text-teal-300">FR-301 ~ FR-304</p><h2 className="mt-2 text-2xl font-bold">{text.precheckTitle}</h2><p className="mt-2 text-sm leading-6 text-slate-300">{text.precheckDescription}</p></div>
          <button className="rounded-xl bg-teal-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-teal-300 disabled:cursor-wait disabled:opacity-60" disabled={precheck.isPending} onClick={runPrecheck}>
            {precheck.isPending ? text.checking : precheck.data ? text.retry : text.precheckButton}
          </button>
        </div>
      </section>

      {missingProfile ? <section className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950"><p className="font-medium">{text.noProfile}</p><Link className="rounded-lg bg-amber-900 px-4 py-2 text-sm font-bold text-white" href="/profile">{text.createProfile} →</Link></section> : null}
      {precheck.isError && !missingProfile ? <p className="mt-5 rounded-2xl bg-rose-50 p-5 text-sm font-medium text-rose-800">{text.precheckError}</p> : null}
      {precheck.data ? <PrecheckResult result={precheck.data} text={text} /> : null}
      {precheck.data ? <AiExplanationPanel data={explanation.data} loading={explanation.isPending} error={explanation.isError} /> : null}
      <ProductGuidancePanel guidance={personalizedGuidance.data ?? guidance.data} sourceUrl={item.sourceUrl} loading={guidance.isLoading} />

      <section className="mt-8 rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-bold">{text.rules}</h2>
        <div className="mt-4 space-y-3">{item.rules.map((rule) => <article className="rounded-xl bg-slate-50 p-4" key={rule.id}>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${levelStyle[rule.ruleLevel]}`}>{rule.ruleLevel}</span>
            <span className="rounded-full border bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">{rule.mandatory ? text.required : text.optional}</span>
          </div>
          <p className="mt-3 font-mono text-sm font-semibold">{rule.ruleKey} {rule.operator} {rule.ruleValue}</p>
          <p className="mt-2 text-sm font-medium text-slate-700">{rule.description}</p>
          <p className="mt-2 text-sm text-slate-600">{rule.sourceExcerpt}</p>
          <dl className="mt-3 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
            <div><dt className="inline font-semibold">{text.locator}: </dt><dd className="inline">{rule.sourceLocator}</dd></div>
            <div><dt className="inline font-semibold">{text.validity}: </dt><dd className="inline">{rule.validFrom ?? text.noLimit} ~ {rule.validTo ?? text.noLimit}</dd></div>
          </dl>
        </article>)}</div>
        {item.rules.length === 0 ? <p className="mt-3 text-sm text-slate-500">{text.noRules}</p> : null}
      </section>
      <RagQuestionPanel productId={item.id} rules={item.rules} />
      <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{text.warning}</p>
    </main>
  );
}

export { ProductDetailDashboard as default } from "@/components/product-detail-dashboard";

function PrecheckResult({ result, text }: { result: EligibilityResult; text: (typeof copy)[keyof typeof copy] }) {
  return <section className="mt-6 space-y-5" aria-live="polite">
    <header className={`rounded-2xl border p-6 ${resultStyle[result.status]}`}>
      <p className="text-xs font-bold tracking-widest">ELIGIBILITY PRE-CHECK</p>
      <h2 className="mt-2 text-2xl font-bold">{text.status[result.status]}</h2>
      <p className="mt-3 text-sm leading-6">{result.disclaimer}</p>
    </header>
    <div className="grid gap-5 lg:grid-cols-2">
      <ResultSection title={text.passed} details={result.passedRules} tone="emerald" evidenceLabel={text.evidence} empty={text.emptySection} />
      <ResultSection title={text.failed} details={result.failedRules} tone="rose" evidenceLabel={text.evidence} empty={text.emptySection} />
      <ResultSection title={text.external} details={result.externalChecks} tone="amber" evidenceLabel={text.evidence} empty={text.emptySection} />
      <ResultSection title={text.unknown} details={result.unknownRules} tone="violet" evidenceLabel={text.evidence} empty={text.emptySection} />
      <ResultSection title={text.insufficient} details={result.insufficientReasons} tone="slate" evidenceLabel={text.evidence} empty={text.emptySection} />
    </div>
    <p className="rounded-xl bg-amber-50 p-4 text-sm font-medium text-amber-950">{result.disclaimer}</p>
  </section>;
}

const sectionTone = {
  emerald: "border-emerald-200 bg-emerald-50/60",
  rose: "border-rose-200 bg-rose-50/60",
  amber: "border-amber-200 bg-amber-50/60",
  violet: "border-violet-200 bg-violet-50/60",
  slate: "border-slate-200 bg-slate-50",
} as const;

function ResultSection({ title, details, tone, evidenceLabel, empty }: { title: string; details: EligibilityRuleDetail[]; tone: keyof typeof sectionTone; evidenceLabel: string; empty: string }) {
  return <section className={`rounded-2xl border p-5 ${sectionTone[tone]}`}>
    <div className="flex items-center justify-between gap-3"><h3 className="font-bold">{title}</h3><span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600">{details.length}</span></div>
    {details.length === 0 ? <p className="mt-4 text-sm text-slate-500">{empty}</p> : <div className="mt-4 space-y-3">{details.map((detail, index) => <article className="rounded-xl border border-white/80 bg-white p-4 shadow-sm" key={`${detail.messageCode}-${detail.key}-${index}`}>
      <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-slate-500">{detail.key}</span>{detail.mandatory ? <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">MANDATORY</span> : null}</div>
      <p className="mt-2 text-sm leading-6 text-slate-800">{detail.message}</p>
      {detail.sourceExcerpt ? <blockquote className="mt-3 border-l-2 border-slate-300 pl-3 text-xs leading-5 text-slate-500">{detail.sourceExcerpt}</blockquote> : null}
      {detail.sourceUrl ? <a className="mt-3 inline-flex text-xs font-semibold text-blue-700 underline" href={detail.sourceUrl} rel="noreferrer" target="_blank">{evidenceLabel}{detail.sourceLocator ? ` · ${detail.sourceLocator}` : ""}</a> : null}
    </article>)}</div>}
  </section>;
}

function Info({ title, body }: { title: string; body: string }) {
  return <section className="rounded-2xl border bg-white p-6"><h2 className="font-bold">{title}</h2><p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{body}</p></section>;
}
