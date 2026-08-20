"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { AnalysisProgress } from "@/components/analysis-progress";
import { AiExplanationPanel } from "@/components/ai-explanation-panel";
import { ProductGuidancePanel } from "@/components/product-guidance-panel";
import { RagQuestionPanel } from "@/components/rag-question-panel";
import { useLocale } from "@/components/providers/locale-provider";
import { getAiExplanation } from "@/services/ai-explanation";
import { precheckEligibility } from "@/services/eligibility";
import { getPersonalizedGuidance, getProductGuidance } from "@/services/guidance";
import { getProduct } from "@/services/product";
import { getProfile, updateProfile } from "@/services/profile";
import type { EligibilityResult, EligibilityRuleDetail, EligibilityStatus } from "@/types/eligibility";
import type { ProductRule } from "@/types/product";
import type { TempProfile, TempProfileInput } from "@/types/profile";

type Tab = "precheck" | "evidence" | "documents" | "steps" | "official";
const copy = {
  ko: { back: "상품 목록", tabs: { precheck: "사전진단", evidence: "판단 근거", documents: "필요서류", steps: "신청 절차", official: "공식 정보" }, run: "내 프로필로 사전자격 확인", rerun: "다시 진단", checking: "공개조건 비교 중...", description: "저장된 임시 프로필과 검수된 공식 Rule을 비교합니다.", noProfile: "임시 프로필이 없거나 만료되었습니다.", create: "프로필 입력", error: "진단을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.", status: { PUBLIC_CONDITIONS_MET: "공개조건 충족", NEED_BANK_CONFIRMATION: "은행 확인 필요", PUBLIC_CONDITIONS_NOT_MET: "공개조건 미충족", INSUFFICIENT_INFORMATION: "정보 부족" }, final: "최종 가입승인이 아닙니다.", passed: "충족 조건", failed: "미충족 조건", external: "은행 확인 조건", unknown: "공개되지 않은 조건", insufficient: "부족한 정보", empty: "해당 항목이 없습니다.", source: "출처", checked: "확인일", locator: "근거 위치", ruleTitle: "검수된 상품조건", noRules: "현재 유효한 승인 Rule이 없습니다.", required: "필수", optional: "선택", summary: "상품 요약", public: "공개조건", additional: "추가 확인 조건", base: "정보 기준일", officialLink: "공식 페이지 열기" },
  en: { back: "Products", tabs: { precheck: "Pre-check", evidence: "Evidence", documents: "Documents", steps: "Application steps", official: "Official information" }, run: "Check eligibility with my profile", rerun: "Check again", checking: "Comparing public conditions...", description: "Compares your saved temporary profile with reviewed official Rules.", noProfile: "Your temporary profile is missing or expired.", create: "Create profile", error: "The check could not be completed. Please try again shortly.", status: { PUBLIC_CONDITIONS_MET: "Public conditions met", NEED_BANK_CONFIRMATION: "Bank confirmation needed", PUBLIC_CONDITIONS_NOT_MET: "Public conditions not met", INSUFFICIENT_INFORMATION: "Insufficient information" }, final: "This is not final approval.", passed: "Conditions met", failed: "Conditions not met", external: "Bank checks", unknown: "Unpublished conditions", insufficient: "Missing information", empty: "No items in this section.", source: "Source", checked: "Checked", locator: "Evidence location", ruleTitle: "Reviewed product conditions", noRules: "There are no currently effective approved Rules.", required: "Required", optional: "Optional", summary: "Product summary", public: "Public conditions", additional: "Additional checks", base: "Information date", officialLink: "Open official page" },
  vi: { back: "Danh sách sản phẩm", tabs: { precheck: "Kiểm tra sơ bộ", evidence: "Căn cứ", documents: "Giấy tờ", steps: "Các bước đăng ký", official: "Thông tin chính thức" }, run: "Kiểm tra bằng hồ sơ của tôi", rerun: "Kiểm tra lại", checking: "Đang so sánh điều kiện công khai...", description: "So sánh hồ sơ tạm thời với Rule chính thức đã kiểm duyệt.", noProfile: "Hồ sơ tạm thời không tồn tại hoặc đã hết hạn.", create: "Nhập hồ sơ", error: "Không thể hoàn tất kiểm tra. Vui lòng thử lại sau.", status: { PUBLIC_CONDITIONS_MET: "Đáp ứng điều kiện công khai", NEED_BANK_CONFIRMATION: "Cần ngân hàng xác nhận", PUBLIC_CONDITIONS_NOT_MET: "Không đáp ứng điều kiện công khai", INSUFFICIENT_INFORMATION: "Thiếu thông tin" }, final: "Đây không phải phê duyệt cuối cùng.", passed: "Điều kiện đã đạt", failed: "Điều kiện chưa đạt", external: "Ngân hàng cần xác nhận", unknown: "Điều kiện không công khai", insufficient: "Thông tin còn thiếu", empty: "Không có mục nào.", source: "Nguồn", checked: "Ngày xác nhận", locator: "Vị trí căn cứ", ruleTitle: "Điều kiện sản phẩm đã duyệt", noRules: "Không có Rule đã duyệt đang có hiệu lực.", required: "Bắt buộc", optional: "Tùy chọn", summary: "Tóm tắt sản phẩm", public: "Điều kiện công khai", additional: "Điều kiện cần xác nhận", base: "Ngày thông tin", officialLink: "Mở trang chính thức" },
} as const;
const dynamicCopy = {
  ko: { title: "이 상품 진단에 추가 정보가 필요합니다", description: "이 상품의 검수된 조건에 필요한 항목만 요청합니다. 답변은 24시간 임시 프로필에 저장됩니다.", save: "저장하고 진단하기", saving: "저장 중...", error: "추가 정보를 저장하지 못했습니다.", choose: "선택하세요", yes: "예", no: "아니요", fields: { hasExistingProductAccount: "현재 동일 상품 계좌를 보유하고 있나요?", desiredMonthlyAmount: "월 납입 희망액 (원)", hasBankAccount: "한국 은행계좌를 보유하고 있나요?", housingType: "주거 형태", desiredAmount: "희망 금액 (원)", preferredBank: "선호 은행" } },
  en: { title: "More information is needed for this product", description: "We ask only for fields required by this product's reviewed rules. Answers are stored in your 24-hour temporary profile.", save: "Save and run pre-check", saving: "Saving...", error: "Could not save the additional information.", choose: "Select", yes: "Yes", no: "No", fields: { hasExistingProductAccount: "Do you already hold this product account?", desiredMonthlyAmount: "Desired monthly amount (KRW)", hasBankAccount: "Do you have a Korean bank account?", housingType: "Housing type", desiredAmount: "Desired amount (KRW)", preferredBank: "Preferred bank" } },
  vi: { title: "Cần thêm thông tin cho sản phẩm này", description: "Chúng tôi chỉ hỏi các mục cần thiết cho quy tắc đã kiểm duyệt của sản phẩm. Câu trả lời được lưu trong hồ sơ tạm thời 24 giờ.", save: "Lưu và kiểm tra", saving: "Đang lưu...", error: "Không thể lưu thông tin bổ sung.", choose: "Chọn", yes: "Có", no: "Không", fields: { hasExistingProductAccount: "Bạn đã có tài khoản của sản phẩm này chưa?", desiredMonthlyAmount: "Số tiền hàng tháng mong muốn (KRW)", hasBankAccount: "Bạn có tài khoản ngân hàng Hàn Quốc không?", housingType: "Hình thức nhà ở", desiredAmount: "Số tiền mong muốn (KRW)", preferredBank: "Ngân hàng ưu tiên" } },
} as const;
const dynamicFieldKeys = ["hasExistingProductAccount", "desiredMonthlyAmount", "hasBankAccount", "housingType", "desiredAmount", "preferredBank"] as const;
type DynamicFieldKey = (typeof dynamicFieldKeys)[number];
type ProfileIdentity = { id: number; sessionId: string };
const tabs: Tab[] = ["precheck", "evidence", "documents", "steps", "official"];
const statusStyle: Record<EligibilityStatus, string> = { PUBLIC_CONDITIONS_MET: "border-emerald-300 bg-emerald-50 text-emerald-950", NEED_BANK_CONFIRMATION: "border-amber-300 bg-amber-50 text-amber-950", PUBLIC_CONDITIONS_NOT_MET: "border-rose-300 bg-rose-50 text-rose-950", INSUFFICIENT_INFORMATION: "border-slate-300 bg-slate-100 text-slate-900" };
const statusIcon: Record<EligibilityStatus, string> = { PUBLIC_CONDITIONS_MET: "●", NEED_BANK_CONFIRMATION: "▲", PUBLIC_CONDITIONS_NOT_MET: "×", INSUFFICIENT_INFORMATION: "○" };

export function ProductDetailDashboard() {
  const { locale } = useLocale(); const text = copy[locale]; const params = useParams<{ id: string }>(); const search = useSearchParams(); const id = Number(params.id);
  const queryClient = useQueryClient();
  const requestedTab = search.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(requestedTab && tabs.includes(requestedTab) ? requestedTab : "precheck");
  const [missingProfile, setMissingProfile] = useState(false);
  const [additionalRequested, setAdditionalRequested] = useState(false);
  const [profileIdentity, setProfileIdentity] = useState<ProfileIdentity | null | undefined>(undefined);
  useEffect(() => {
    const storedId = Number(localStorage.getItem("visafyProfileId"));
    const sessionId = localStorage.getItem("visafyProfileSessionId");
    setProfileIdentity(Number.isInteger(storedId) && storedId > 0 && sessionId ? { id: storedId, sessionId } : null);
  }, []);
  const product = useQuery({ queryKey: ["product", id], queryFn: () => getProduct(id), enabled: Number.isFinite(id) });
  const profile = useQuery({ queryKey: ["profile", profileIdentity?.id, profileIdentity?.sessionId], queryFn: () => getProfile(profileIdentity!.id, profileIdentity!.sessionId), enabled: Boolean(profileIdentity) });
  const guidance = useQuery({ queryKey: ["product-guidance", id, locale], queryFn: () => getProductGuidance(id, locale), enabled: Number.isFinite(id) });
  const precheck = useMutation({ mutationFn: precheckEligibility, onError: (error: Error) => setMissingProfile(/profile|expired/i.test(error.message)) });
  const explanation = useMutation({ mutationFn: getAiExplanation });
  const personalized = useMutation({ mutationFn: ({ productId, profileSessionId }: { productId: number; profileSessionId: string }) => getPersonalizedGuidance(productId, profileSessionId) });
  const profileUpdate = useMutation({
    mutationFn: (changes: Partial<TempProfileInput>) => {
      if (!profileIdentity || !profile.data) throw new Error("PROFILE_NOT_AVAILABLE");
      return updateProfile(profileIdentity.id, profileIdentity.sessionId, { ...toProfileInput(profile.data), ...changes });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["profile", updated.id, updated.sessionId], updated);
      setAdditionalRequested(false);
      executePrecheck(updated.sessionId);
    },
  });
  function executePrecheck(profileSessionId: string) { setMissingProfile(false); explanation.reset(); personalized.reset(); const request = { profileSessionId, productId: id }; precheck.mutate(request, { onSuccess: () => { explanation.mutate(request); personalized.mutate(request); } }); }
  function run() {
    if (!profileIdentity || profile.isError) { setMissingProfile(true); return; }
    if (!profile.data || !product.data) return;
    if (missingRequiredFields(product.data.requiredFields, profile.data).length) { setAdditionalRequested(true); return; }
    executePrecheck(profileIdentity.sessionId);
  }
  if (product.isLoading) return <main className="mx-auto max-w-6xl px-6 py-12"><div className="h-60 animate-pulse rounded-3xl bg-slate-200" /></main>;
  if (product.isError || !product.data) return <main className="mx-auto max-w-6xl px-6 py-12 text-rose-700">{product.error?.message ?? "Product not found"}</main>;
  const item = product.data; const currentGuidance = personalized.data ?? guidance.data;
  const missingFields = profile.data ? missingRequiredFields(item.requiredFields, profile.data) : [];
  const evidenceRequested = Boolean(precheck.data); const evidenceDone = evidenceRequested && !explanation.isPending && !personalized.isPending;
  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
    <Link className="text-sm font-bold text-blue-700" href="/products">← {text.back}</Link>
    <header className="mt-5 rounded-3xl bg-slate-950 p-7 text-white sm:p-10"><div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{item.diagnosisStatus}</span><span className="text-sm text-slate-300">{item.institution}</span></div><h1 className="mt-5 text-3xl font-bold sm:text-4xl">{item.productName}</h1><p className="mt-4 max-w-3xl leading-7 text-slate-300">{item.description}</p></header>
    <nav className="sticky top-2 z-20 mt-6 overflow-x-auto rounded-2xl border bg-white/95 p-2 shadow-sm backdrop-blur" aria-label="Product detail tabs" role="tablist"><div className="flex min-w-max gap-1">{tabs.map((tab) => <button aria-selected={activeTab === tab} className={`rounded-xl px-4 py-3 text-sm font-bold transition ${activeTab === tab ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-100"}`} key={tab} onClick={() => setActiveTab(tab)} role="tab" type="button">{text.tabs[tab]}</button>)}</div></nav>

    {activeTab === "precheck" ? <section className="mt-6" role="tabpanel"><div className="rounded-3xl bg-gradient-to-br from-blue-950 to-slate-950 p-7 text-white sm:p-9"><div className="flex flex-wrap items-center justify-between gap-5"><div><h2 className="text-2xl font-bold">{text.run}</h2><p className="mt-2 text-sm text-slate-300">{text.description}</p></div><button className="rounded-xl bg-teal-400 px-5 py-3 font-black text-slate-950 disabled:opacity-60" disabled={precheck.isPending || profile.isFetching || profileIdentity === undefined} onClick={run}>{precheck.isPending || profile.isFetching ? text.checking : precheck.data ? text.rerun : text.run}</button></div></div>
      {additionalRequested && profile.data && missingFields.length ? <DynamicProfileFields fields={missingFields} locale={locale} pending={profileUpdate.isPending} error={profileUpdate.isError} onSubmit={(changes) => profileUpdate.mutate(changes)} /> : null}
      {precheck.isPending ? <div className="mt-5"><AnalysisProgress /></div> : null}
      {precheck.data && !evidenceDone ? <div className="mt-5"><AnalysisProgress recommendationDone evidenceRequested evidenceDone={false} /></div> : null}
      {missingProfile ? <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-50 p-5 text-amber-950"><p>{text.noProfile}</p><Link className="rounded-lg bg-amber-900 px-4 py-2 text-sm font-bold text-white" href="/profile">{text.create} →</Link></div> : null}
      {precheck.isError && !missingProfile ? <p className="mt-5 rounded-2xl bg-rose-50 p-5 text-rose-800">{text.error}</p> : null}
      {precheck.data ? <PrecheckResult result={precheck.data} rules={item.rules} sourceTitle={item.sourceTitle} text={text} /> : null}
      {precheck.data ? <div id="bank-inquiry"><AiExplanationPanel data={explanation.data} loading={explanation.isPending} error={explanation.isError} /></div> : null}
    </section> : null}
    {activeTab === "evidence" ? <section className="mt-6" role="tabpanel"><RuleEvidence rules={item.rules} sourceTitle={item.sourceTitle} text={text} /><RagQuestionPanel productId={item.id} rules={item.rules} /></section> : null}
    {activeTab === "documents" ? <section className="mt-6" role="tabpanel"><ProductGuidancePanel guidance={currentGuidance} sourceUrl={item.sourceUrl} loading={guidance.isLoading || personalized.isPending} view="documents" /></section> : null}
    {activeTab === "steps" ? <section className="mt-6" role="tabpanel"><ProductGuidancePanel guidance={currentGuidance} sourceUrl={item.sourceUrl} loading={guidance.isLoading || personalized.isPending} view="steps" /></section> : null}
    {activeTab === "official" ? <section className="mt-6 grid gap-5 sm:grid-cols-2" role="tabpanel"><Info title={text.summary} body={item.targetSummary} /><Info title={text.public} body={item.publicConditions} /><Info title={text.additional} body={item.additionalConditions} /><article className="rounded-2xl border bg-white p-6"><h2 className="font-bold">{item.sourceTitle}</h2><p className="mt-3 text-sm text-slate-500">{text.base}: {item.informationBaseDate}</p><a className="mt-5 inline-flex rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white" href={item.sourceUrl} rel="noreferrer" target="_blank">{text.officialLink} ↗</a></article></section> : null}
    <p className="mt-8 rounded-xl bg-amber-50 p-4 text-center text-sm font-bold text-amber-950">{text.final}</p>
  </main>;
}

function PrecheckResult({ result, rules, sourceTitle, text }: { result: EligibilityResult; rules: ProductRule[]; sourceTitle: string; text: (typeof copy)[keyof typeof copy] }) { return <section className="mt-6 space-y-5" aria-live="polite"><header className={`rounded-2xl border p-6 ${statusStyle[result.status]}`}><p className="text-xs font-black tracking-widest">ELIGIBILITY PRE-CHECK</p><h2 className="mt-2 text-2xl font-bold"><span className="mr-2">{statusIcon[result.status]}</span>{text.status[result.status]}</h2><p className="mt-3 text-sm font-bold">{text.final}</p></header><div className="grid gap-5 lg:grid-cols-2"><ResultGroup title={text.passed} items={result.passedRules} tone="emerald" rules={rules} sourceTitle={sourceTitle} text={text} /><ResultGroup title={text.failed} items={result.failedRules} tone="rose" rules={rules} sourceTitle={sourceTitle} text={text} /><ResultGroup title={text.external} items={result.externalChecks} tone="amber" rules={rules} sourceTitle={sourceTitle} text={text} /><ResultGroup title={text.unknown} items={result.unknownRules} tone="violet" rules={rules} sourceTitle={sourceTitle} text={text} /><ResultGroup title={text.insufficient} items={result.insufficientReasons} tone="slate" rules={rules} sourceTitle={sourceTitle} text={text} /></div><p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-950">{result.disclaimer}</p></section>; }
const tones = { emerald: "border-emerald-200 bg-emerald-50", rose: "border-rose-200 bg-rose-50", amber: "border-amber-200 bg-amber-50", violet: "border-violet-200 bg-violet-50", slate: "border-slate-200 bg-slate-50" } as const;
function ResultGroup({ title, items, tone, rules, sourceTitle, text }: { title: string; items: EligibilityRuleDetail[]; tone: keyof typeof tones; rules: ProductRule[]; sourceTitle: string; text: (typeof copy)[keyof typeof copy] }) { return <section className={`rounded-2xl border p-5 ${tones[tone]}`}><div className="flex justify-between"><h3 className="font-bold">{title}</h3><span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold">{items.length}</span></div>{items.length ? <div className="mt-4 space-y-3">{items.map((detail, index) => { const rule = rules.find((candidate) => candidate.id === detail.ruleId || candidate.ruleKey === detail.key); return <article className="rounded-xl bg-white p-4 shadow-sm" key={`${detail.key}-${index}`}><p className="text-sm font-semibold leading-6">{detail.message}</p>{detail.sourceExcerpt ? <blockquote className="mt-2 border-l-2 pl-3 text-xs leading-5 text-slate-500">{detail.sourceExcerpt}</blockquote> : null}{detail.sourceUrl ? <div className="mt-3 text-xs text-slate-500"><a className="font-bold text-blue-700 underline" href={detail.sourceUrl} rel="noreferrer" target="_blank">{text.source}: {sourceTitle}</a>{rule?.verifiedAt ? <span> · {text.checked}: {rule.verifiedAt.slice(0, 10)}</span> : null}{detail.sourceLocator ? <p className="mt-1">{text.locator}: {detail.sourceLocator}</p> : null}</div> : null}</article>; })}</div> : <p className="mt-4 text-sm text-slate-500">{text.empty}</p>}</section>; }
function RuleEvidence({ rules, sourceTitle, text }: { rules: ProductRule[]; sourceTitle: string; text: (typeof copy)[keyof typeof copy] }) { return <section className="rounded-3xl border bg-white p-6 sm:p-8"><h2 className="text-2xl font-bold">{text.ruleTitle}</h2>{rules.length ? <div className="mt-5 grid gap-4">{rules.map((rule) => <article className="rounded-2xl bg-slate-50 p-5" key={rule.id}><div className="flex flex-wrap gap-2"><span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800">{rule.ruleLevel}</span><span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600">{rule.mandatory ? text.required : text.optional}</span></div><p className="mt-3 font-mono text-sm font-bold">{rule.ruleKey} {rule.operator} {rule.ruleValue}</p><p className="mt-2 text-sm text-slate-700">{rule.description}</p><blockquote className="mt-3 border-l-2 border-slate-300 pl-3 text-xs leading-5 text-slate-500">{rule.sourceExcerpt}</blockquote><p className="mt-3 text-xs text-slate-500">{text.source}: {sourceTitle} · {text.checked}: {rule.verifiedAt.slice(0, 10)} · {text.locator}: {rule.sourceLocator}</p></article>)}</div> : <p className="mt-4 text-slate-500">{text.noRules}</p>}</section>; }
function Info({ title, body }: { title: string; body: string }) { return <article className="rounded-2xl border bg-white p-6"><h2 className="font-bold">{title}</h2><p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{body}</p></article>; }

function missingRequiredFields(requiredFields: string[], profile: TempProfile): DynamicFieldKey[] {
  return requiredFields
    .filter((field): field is DynamicFieldKey => dynamicFieldKeys.includes(field as DynamicFieldKey))
    .filter((field) => profile[field] === null || profile[field] === undefined || profile[field] === "");
}

function toProfileInput(profile: TempProfile): TempProfileInput {
  const { id: _id, sessionId: _sessionId, expiresAt: _expiresAt, ...input } = profile;
  return input;
}

function DynamicProfileFields({ fields, locale, pending, error, onSubmit }: { fields: DynamicFieldKey[]; locale: keyof typeof dynamicCopy; pending: boolean; error: boolean; onSubmit: (changes: Partial<TempProfileInput>) => void }) {
  const text = dynamicCopy[locale];
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const changes: Record<string, string | number | boolean> = {};
    for (const field of fields) {
      const value = data.get(field);
      if (field === "hasExistingProductAccount" || field === "hasBankAccount") changes[field] = value === "true";
      else if (field === "desiredMonthlyAmount" || field === "desiredAmount") changes[field] = Number(value);
      else changes[field] = String(value ?? "");
    }
    onSubmit(changes as Partial<TempProfileInput>);
  }
  return <form className="mt-5 rounded-3xl border border-blue-200 bg-blue-50 p-6 sm:p-7" onSubmit={submit}>
    <h3 className="text-xl font-bold text-blue-950">{text.title}</h3>
    <p className="mt-2 text-sm leading-6 text-blue-900">{text.description}</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">{fields.map((field) => <label className="text-sm font-semibold text-slate-800" key={field}>{text.fields[field]}
      {field === "hasExistingProductAccount" || field === "hasBankAccount" ? <select className="mt-2 w-full rounded-xl border border-blue-200 bg-white px-4 py-3" defaultValue="" name={field} required><option disabled value="">{text.choose}</option><option value="true">{text.yes}</option><option value="false">{text.no}</option></select> : <input className="mt-2 w-full rounded-xl border border-blue-200 bg-white px-4 py-3" inputMode={field === "desiredMonthlyAmount" || field === "desiredAmount" ? "numeric" : undefined} min={field === "desiredMonthlyAmount" || field === "desiredAmount" ? 0 : undefined} name={field} required type={field === "desiredMonthlyAmount" || field === "desiredAmount" ? "number" : "text"} />}
    </label>)}</div>
    {error ? <p className="mt-4 text-sm font-semibold text-rose-700">{text.error}</p> : null}
    <button className="mt-5 rounded-xl bg-blue-800 px-5 py-3 font-bold text-white disabled:opacity-60" disabled={pending} type="submit">{pending ? text.saving : text.save}</button>
  </form>;
}
