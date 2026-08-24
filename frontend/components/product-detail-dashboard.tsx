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
const dynamicFieldKeys = ["birthDate", "visaType", "visaExpiry", "residencyStartDate", "occupation", "employmentType", "monthlyIncome", "employmentDurationMonths", "residentStatus", "hasExistingProductAccount", "desiredMonthlyAmount", "hasBankAccount", "hasKoreanBankAccount", "hasResidenceCard", "hasPassport", "hasDomesticPhone", "canDomesticPhoneVerify", "hasKoreanCreditHistory", "preferredChannel", "remittanceCountry", "housingType", "desiredAmount", "preferredBank"] as const;
type DynamicFieldKey = (typeof dynamicFieldKeys)[number];
type ProfileIdentity = { id: number; sessionId: string };
const tabs: Tab[] = ["precheck", "evidence", "documents", "steps", "official"];
const statusStyle: Record<EligibilityStatus, string> = { PUBLIC_CONDITIONS_MET: "border-status-success-border bg-status-success-bg text-status-success", NEED_BANK_CONFIRMATION: "border-status-warning-border bg-status-warning-bg text-status-warning", PUBLIC_CONDITIONS_NOT_MET: "border-status-danger-border bg-status-danger-bg text-status-danger", INSUFFICIENT_INFORMATION: "border-status-neutral-border bg-status-neutral-bg text-status-neutral" };
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
  if (product.isLoading) return <main className="ui-page"><div className="h-52 animate-pulse rounded-panel border border-line bg-surface-subtle" /></main>;
  if (product.isError || !product.data) return <main className="ui-page"><p className="ui-alert-danger" role="alert">{product.error?.message ?? "Product not found"}</p></main>;
  const item = product.data; const currentGuidance = personalized.data ?? guidance.data;
  const missingFields = profile.data ? missingRequiredFields(item.requiredFields, profile.data) : [];
  const evidenceRequested = Boolean(precheck.data); const evidenceDone = evidenceRequested && !explanation.isPending && !personalized.isPending;
  return <main className="ui-page">
    <Link className="ui-link inline-flex min-h-11 items-center" href="/products">← {text.back}</Link>
    <header className="ui-card mt-4 p-6 sm:p-8"><div className="flex flex-wrap items-center gap-3"><span className="rounded-full border border-line bg-surface-subtle px-3 py-1 text-xs font-semibold text-muted">{item.diagnosisStatus}</span><span className="text-sm font-semibold text-brand">{item.institution}</span></div><h1 className="mt-4 text-3xl font-bold leading-tight text-ink sm:text-4xl">{item.productName}</h1><p className="mt-4 max-w-reading text-base leading-7 text-muted">{item.description}</p></header>
    <nav className="sticky top-16 z-20 mt-6 overflow-x-auto rounded-card border border-line bg-surface p-1.5 shadow-card" aria-label="Product detail tabs" role="tablist"><div className="flex min-w-max gap-1">{tabs.map((tab) => <button aria-selected={activeTab === tab} className={`min-h-11 rounded-control border px-4 py-2.5 text-sm font-semibold transition duration-200 ${activeTab === tab ? "border-brand bg-brand-soft text-brand" : "border-transparent text-muted hover:bg-surface-subtle hover:text-ink"}`} key={tab} onClick={() => setActiveTab(tab)} role="tab" type="button">{text.tabs[tab]}</button>)}</div></nav>

    {activeTab === "precheck" ? <section className="mt-6" role="tabpanel"><div className="rounded-panel border border-status-info-border bg-status-info-bg p-6 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-5"><div className="max-w-reading"><h2 className="text-2xl font-bold text-ink">{text.run}</h2><p className="mt-2 text-sm leading-6 text-muted">{text.description}</p></div><button className="ui-button ui-button-primary min-h-12" disabled={precheck.isPending || profile.isFetching || profileIdentity === undefined} onClick={run}>{precheck.isPending || profile.isFetching ? text.checking : precheck.data ? text.rerun : text.run}</button></div></div>
      {additionalRequested && profile.data && missingFields.length ? <DynamicProfileFields fields={missingFields} locale={locale} pending={profileUpdate.isPending} error={profileUpdate.isError} onSubmit={(changes) => profileUpdate.mutate(changes)} /> : null}
      {precheck.isPending ? <div className="mt-5"><AnalysisProgress /></div> : null}
      {precheck.data && !evidenceDone ? <div className="mt-5"><AnalysisProgress recommendationDone evidenceRequested evidenceDone={false} /></div> : null}
      {missingProfile ? <div className="ui-alert-warning mt-5 flex flex-wrap items-center justify-between gap-3"><p>{text.noProfile}</p><Link className="ui-button ui-button-primary" href="/profile">{text.create} →</Link></div> : null}
      {precheck.isError && !missingProfile ? <p className="ui-alert-danger mt-5" role="alert">{text.error}</p> : null}
      {precheck.data ? <PrecheckResult locale={locale} result={precheck.data} rules={item.rules} sourceTitle={item.sourceTitle} text={text} /> : null}
      {precheck.data ? <div id="bank-inquiry"><AiExplanationPanel data={explanation.data} loading={explanation.isPending} error={explanation.isError} /></div> : null}
    </section> : null}
    {activeTab === "evidence" ? <section className="mt-6" role="tabpanel"><RuleEvidence rules={item.rules} sourceTitle={item.sourceTitle} text={text} /><RagQuestionPanel productId={item.id} rules={item.rules} /></section> : null}
    {activeTab === "documents" ? <section className="mt-6" role="tabpanel"><ProductGuidancePanel guidance={currentGuidance} sourceUrl={item.sourceUrl} loading={guidance.isLoading || personalized.isPending} view="documents" /></section> : null}
    {activeTab === "steps" ? <section className="mt-6" role="tabpanel"><ProductGuidancePanel guidance={currentGuidance} sourceUrl={item.sourceUrl} loading={guidance.isLoading || personalized.isPending} view="steps" /></section> : null}
    {activeTab === "official" ? <section className="mt-6 grid gap-5 sm:grid-cols-2" role="tabpanel"><Info title={text.summary} body={item.targetSummary} /><Info title={text.public} body={item.publicConditions} /><Info title={text.additional} body={item.additionalConditions} /><article className="ui-card p-6"><p className="text-xs font-semibold text-brand">{text.source}</p><h2 className="mt-2 font-bold text-ink">{item.sourceTitle}</h2><p className="mt-3 text-sm text-muted">{text.base}: {item.informationBaseDate}</p><a className="ui-button ui-button-primary mt-5" href={item.sourceUrl} rel="noreferrer" target="_blank">{text.officialLink} ↗</a></article></section> : null}
    <p className="ui-alert-warning mt-8 text-center font-semibold">{text.final}</p>
  </main>;
}

function PrecheckResult({ locale, result, rules, sourceTitle, text }: { locale: "ko" | "en" | "vi"; result: EligibilityResult; rules: ProductRule[]; sourceTitle: string; text: (typeof copy)[keyof typeof copy] }) { return <section className="mt-6 space-y-5" aria-live="polite"><header className={`rounded-panel border p-6 sm:p-7 ${statusStyle[result.status]}`}><p className="text-xs font-bold tracking-wider">ELIGIBILITY PRE-CHECK</p><h2 className="mt-2 text-2xl font-bold"><span className="mr-2" aria-hidden>{statusIcon[result.status]}</span>{text.status[result.status]}</h2><p className="mt-3 text-sm font-semibold">{result.disclaimer}</p></header><AccessPanel access={result.accessAssessment} locale={locale} /><div className="grid gap-5 lg:grid-cols-2"><ResultGroup title={text.passed} items={result.passedRules} tone="emerald" rules={rules} sourceTitle={sourceTitle} text={text} /><ResultGroup title={text.failed} items={result.failedRules} tone="rose" rules={rules} sourceTitle={sourceTitle} text={text} /><ResultGroup title={text.external} items={result.externalChecks} tone="amber" rules={rules} sourceTitle={sourceTitle} text={text} /><ResultGroup title={text.unknown} items={result.unknownRules} tone="violet" rules={rules} sourceTitle={sourceTitle} text={text} /><ResultGroup title={text.insufficient} items={result.insufficientReasons} tone="slate" rules={rules} sourceTitle={sourceTitle} text={text} /></div><p className="ui-alert-warning">{result.disclaimer}</p></section>; }

function AccessPanel({ access, locale }: { access: EligibilityResult["accessAssessment"]; locale: "ko" | "en" | "vi" }) {
  const labels = locale === "ko" ? { title: "금융서비스 이용방법", eligibility: "가입조건과 앱·영업점 이용 가능 여부는 별도입니다.", id: "신분확인", branch: "영업점", online: "모바일·온라인", source: "공식 근거", guard: "'실명의 개인' 문구만으로 외국인 이용 가능을 판단하지 않았습니다." } : locale === "en" ? { title: "How you can access this service", eligibility: "Eligibility and app/branch access are assessed separately.", id: "Identification", branch: "Branch", online: "Mobile / online", source: "Official evidence", guard: "We did not infer foreign-customer access from 'real-name individual' alone." } : { title: "Cách sử dụng dịch vụ", eligibility: "Điều kiện và khả năng dùng ứng dụng/chi nhánh được đánh giá riêng.", id: "Xác minh danh tính", branch: "Chi nhánh", online: "Di động / trực tuyến", source: "Căn cứ chính thức", guard: "Không suy luận người nước ngoài có thể sử dụng chỉ từ cụm từ về danh tính thực." };
  const availability = (value: string) => value === "AVAILABLE" ? "✓" : value === "NOT_AVAILABLE" ? "×" : value === "NEED_CONFIRMATION" ? "!" : "?";
  return <section className="ui-card p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="ui-eyebrow">ACCESS · {access.status}</p><h3 className="mt-2 text-xl font-bold text-ink">{labels.title}</h3><p className="mt-2 text-sm text-muted">{labels.eligibility}</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3">{[[labels.id, access.identification], [labels.branch, access.branch], [labels.online, access.online]].map(([label, value]) => <div className="rounded-control border border-line bg-surface-subtle p-4" key={label}><p className="text-xs font-semibold text-muted">{label}</p><p className="mt-2 font-bold text-ink"><span className="mr-2" aria-hidden>{availability(value)}</span>{value}</p></div>)}</div>{access.realNameGuardrailApplied ? <p className="ui-alert-warning mt-4">{labels.guard}</p> : null}{access.details.length ? <div className="mt-4 space-y-2">{access.details.map((detail, index) => <article className="rounded-control border border-line p-3" key={`${detail.key}-${index}`}><p className="text-sm font-semibold text-ink">{detail.message}</p>{detail.sourceExcerpt ? <blockquote className="mt-2 border-l-2 border-line-strong pl-3 text-xs text-muted">{detail.sourceExcerpt}</blockquote> : null}{detail.sourceUrl ? <a className="ui-link mt-2 inline-flex text-xs" href={detail.sourceUrl} rel="noreferrer" target="_blank">{labels.source} ↗</a> : null}</article>)}</div> : null}</section>;
}
const tones = { emerald: "border-status-success-border bg-status-success-bg", rose: "border-status-danger-border bg-status-danger-bg", amber: "border-status-warning-border bg-status-warning-bg", violet: "border-status-neutral-border bg-status-neutral-bg", slate: "border-status-neutral-border bg-status-neutral-bg" } as const;
function ResultGroup({ title, items, tone, rules, sourceTitle, text }: { title: string; items: EligibilityRuleDetail[]; tone: keyof typeof tones; rules: ProductRule[]; sourceTitle: string; text: (typeof copy)[keyof typeof copy] }) { return <section className={`rounded-card border p-5 ${tones[tone]}`}><div className="flex justify-between gap-3"><h3 className="font-bold text-ink">{title}</h3><span className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-muted">{items.length}</span></div>{items.length ? <div className="mt-4 space-y-3">{items.map((detail, index) => { const rule = rules.find((candidate) => candidate.id === detail.ruleId || candidate.ruleKey === detail.key); return <article className="rounded-control border border-line bg-surface p-4" key={`${detail.key}-${index}`}><p className="text-sm font-semibold leading-6 text-ink">{detail.message}</p>{detail.sourceExcerpt ? <blockquote className="mt-2 border-l-2 border-line-strong pl-3 text-xs leading-5 text-muted">{detail.sourceExcerpt}</blockquote> : null}{detail.sourceUrl ? <div className="mt-3 text-xs leading-5 text-muted"><a className="ui-link" href={detail.sourceUrl} rel="noreferrer" target="_blank">{text.source}: {sourceTitle} ↗</a>{rule?.verifiedAt ? <span> · {text.checked}: {rule.verifiedAt.slice(0, 10)}</span> : null}{detail.sourceLocator ? <p className="mt-1">{text.locator}: {detail.sourceLocator}</p> : null}</div> : null}</article>; })}</div> : <p className="mt-4 text-sm text-muted">{text.empty}</p>}</section>; }
function RuleEvidence({ rules, sourceTitle, text }: { rules: ProductRule[]; sourceTitle: string; text: (typeof copy)[keyof typeof copy] }) { return <section className="ui-card p-6 sm:p-8"><p className="ui-eyebrow">{text.source}</p><h2 className="mt-2 text-2xl font-bold text-ink">{text.ruleTitle}</h2>{rules.length ? <div className="mt-5 grid gap-3">{rules.map((rule) => <details className="rounded-card border border-line bg-surface" key={rule.id}><summary className="flex min-h-14 cursor-pointer list-none flex-wrap items-center gap-2 px-5 py-4"><span className="rounded-full border border-status-info-border bg-status-info-bg px-2.5 py-1 text-xs font-semibold text-status-info">{rule.ruleLevel}</span><span className="rounded-full border border-line bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-muted">{rule.mandatory ? text.required : text.optional}</span><span className="min-w-0 flex-1"><strong className="block text-sm text-ink">{rule.description}</strong><span className="mt-1 block text-xs text-muted">{sourceTitle}</span></span><span className="text-muted" aria-hidden>＋</span></summary><div className="border-t border-line px-5 py-4"><p className="text-sm font-semibold tabular-nums text-ink">{rule.ruleKey} {rule.operator} {rule.ruleValue}</p><blockquote className="mt-3 border-l-2 border-line-strong pl-3 text-sm leading-6 text-muted">{rule.sourceExcerpt}</blockquote><dl className="mt-4 grid gap-2 text-xs leading-5 text-muted sm:grid-cols-2"><div><dt className="font-semibold text-ink">{text.checked}</dt><dd>{rule.verifiedAt.slice(0, 10)}</dd></div><div><dt className="font-semibold text-ink">{text.locator}</dt><dd>{rule.sourceLocator}</dd></div></dl></div></details>)}</div> : <p className="mt-4 text-muted">{text.noRules}</p>}</section>; }
function Info({ title, body }: { title: string; body: string }) { return <article className="ui-card p-6"><h2 className="font-bold text-ink">{title}</h2><p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted">{body}</p></article>; }

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
      if (["hasExistingProductAccount", "hasBankAccount", "hasKoreanBankAccount", "hasResidenceCard", "hasPassport", "hasDomesticPhone", "canDomesticPhoneVerify", "hasKoreanCreditHistory"].includes(field)) changes[field] = value === "true";
      else if (["desiredMonthlyAmount", "desiredAmount", "monthlyIncome", "employmentDurationMonths"].includes(field)) changes[field] = Number(value);
      else changes[field] = String(value ?? "");
    }
    onSubmit(changes as Partial<TempProfileInput>);
  }
  return <form className="mt-5 rounded-panel border border-status-info-border bg-status-info-bg p-6 sm:p-7" onSubmit={submit}>
    <h3 className="text-xl font-bold text-ink">{text.title}</h3>
    <p className="mt-2 text-sm leading-6 text-muted">{text.description}</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">{fields.map((field) => <label className="ui-label" key={field}>{dynamicFieldLabel(field, locale)}{dynamicFieldControl(field, text)}</label>)}</div>
    {error ? <p className="mt-4 text-sm font-semibold text-status-danger" role="alert">{text.error}</p> : null}
    <button className="ui-button ui-button-primary mt-5" disabled={pending} type="submit">{pending ? text.saving : text.save}</button>
  </form>;
}

function dynamicFieldControl(field: DynamicFieldKey, text: (typeof dynamicCopy)[keyof typeof dynamicCopy]) {
  const booleans = ["hasExistingProductAccount", "hasBankAccount", "hasKoreanBankAccount", "hasResidenceCard", "hasPassport", "hasDomesticPhone", "canDomesticPhoneVerify", "hasKoreanCreditHistory"];
  if (booleans.includes(field)) return <select className="ui-input" defaultValue="" name={field} required><option disabled value="">{text.choose}</option><option value="true">{text.yes}</option><option value="false">{text.no}</option></select>;
  if (field === "visaType") return <select className="ui-input" defaultValue="" name={field} required><option disabled value="">{text.choose}</option>{["D-2", "D-4", "E-7", "E-9", "F-2", "F-5", "F-6"].map((visa) => <option key={visa}>{visa}</option>)}</select>;
  if (field === "residentStatus") return <select className="ui-input" defaultValue="" name={field} required><option disabled value="">{text.choose}</option><option value="RESIDENT">RESIDENT</option><option value="NON_RESIDENT">NON_RESIDENT</option></select>;
  if (field === "preferredChannel") return <select className="ui-input" defaultValue="" name={field} required><option disabled value="">{text.choose}</option><option value="ONLINE">ONLINE / MOBILE</option><option value="BRANCH">BRANCH</option></select>;
  const numeric = ["desiredMonthlyAmount", "desiredAmount", "monthlyIncome", "employmentDurationMonths"].includes(field);
  const date = ["birthDate", "visaExpiry", "residencyStartDate"].includes(field);
  return <input className="ui-input" inputMode={numeric ? "numeric" : undefined} min={numeric ? 0 : undefined} name={field} required type={numeric ? "number" : date ? "date" : "text"} />;
}

function dynamicFieldLabel(field: DynamicFieldKey, locale: "ko" | "en" | "vi") {
  const ko: Record<DynamicFieldKey, string> = { birthDate: "생년월일", visaType: "비자 종류", visaExpiry: "비자 만료일", residencyStartDate: "한국 체류 시작일", occupation: "직업", employmentType: "고용형태", monthlyIncome: "월 소득 (원)", employmentDurationMonths: "근속기간 (개월)", residentStatus: "거주자 구분", hasExistingProductAccount: "기존 동일상품 계좌 보유", desiredMonthlyAmount: "월 희망 납입액", hasBankAccount: "한국 계좌 보유", hasKoreanBankAccount: "한국 입출금계좌 보유", hasResidenceCard: "체류카드 보유", hasPassport: "여권 보유", hasDomesticPhone: "국내 휴대전화 보유", canDomesticPhoneVerify: "휴대전화 본인인증 가능", hasKoreanCreditHistory: "한국 신용이력 보유", preferredChannel: "선호 신청채널", remittanceCountry: "송금 대상 국가", housingType: "주거 형태", desiredAmount: "희망 금액", preferredBank: "선호 은행" };
  if (locale === "ko") return ko[field];
  return field.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase());
}
