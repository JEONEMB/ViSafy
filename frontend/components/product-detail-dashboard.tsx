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
import type { Locale } from "@/i18n/config";
import { getAiExplanation } from "@/services/ai-explanation";
import { precheckEligibility } from "@/services/eligibility";
import { getPersonalizedGuidance, getProductGuidance } from "@/services/guidance";
import { getProduct } from "@/services/product";
import { getProfile, updateProfile } from "@/services/profile";
import type { AccessAvailability, EligibilityResult, EligibilityRuleDetail, EligibilityStatus } from "@/types/eligibility";
import type { FinancialProduct, ProductRule } from "@/types/product";
import type { TempProfile, TempProfileInput } from "@/types/profile";

type Tab = "precheck" | "evidence" | "documents" | "steps" | "official";
const copy = {
  ko: { back: "상품 목록", tabs: { precheck: "사전진단", evidence: "판단 근거", documents: "필요서류", steps: "신청 절차", official: "공식 정보" }, run: "내 프로필로 사전자격 확인", rerun: "다시 진단", checking: "공개조건 비교 중...", description: "저장된 임시 프로필과 검수된 공식 Rule을 비교합니다.", noProfile: "임시 프로필이 없거나 만료되었습니다.", create: "프로필 입력", error: "진단을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.", status: { PUBLIC_CONDITIONS_MET: "공개조건 충족", NEED_BANK_CONFIRMATION: "은행 확인 필요", PUBLIC_CONDITIONS_NOT_MET: "공개조건 미충족", INSUFFICIENT_INFORMATION: "정보 부족" }, final: "최종 가입승인이 아닙니다.", passed: "충족 조건", failed: "미충족 조건", external: "은행 확인 조건", unknown: "공개되지 않은 조건", insufficient: "부족한 정보", empty: "해당 항목이 없습니다.", source: "출처", checked: "확인일", locator: "근거 위치", ruleTitle: "검수된 상품조건", noRules: "현재 유효한 승인 Rule이 없습니다.", required: "필수", optional: "선택", summary: "상품 요약", public: "공개조건", additional: "추가 확인 조건", base: "정보 기준일", officialLink: "공식 페이지 열기" },
  en: { back: "Products", tabs: { precheck: "Pre-check", evidence: "Evidence", documents: "Documents", steps: "Application steps", official: "Official information" }, run: "Check eligibility with my profile", rerun: "Check again", checking: "Comparing public conditions...", description: "Compares your saved temporary profile with reviewed official Rules.", noProfile: "Your temporary profile is missing or expired.", create: "Create profile", error: "The check could not be completed. Please try again shortly.", status: { PUBLIC_CONDITIONS_MET: "Public conditions met", NEED_BANK_CONFIRMATION: "Bank confirmation needed", PUBLIC_CONDITIONS_NOT_MET: "Public conditions not met", INSUFFICIENT_INFORMATION: "Insufficient information" }, final: "This is not final approval.", passed: "Conditions met", failed: "Conditions not met", external: "Bank checks", unknown: "Unpublished conditions", insufficient: "Missing information", empty: "No items in this section.", source: "Source", checked: "Checked", locator: "Evidence location", ruleTitle: "Reviewed product conditions", noRules: "There are no currently effective approved Rules.", required: "Required", optional: "Optional", summary: "Product summary", public: "Public conditions", additional: "Additional checks", base: "Information date", officialLink: "Open official page" },
  vi: { back: "Danh sách sản phẩm", tabs: { precheck: "Kiểm tra sơ bộ", evidence: "Căn cứ", documents: "Giấy tờ", steps: "Các bước đăng ký", official: "Thông tin chính thức" }, run: "Kiểm tra bằng hồ sơ của tôi", rerun: "Kiểm tra lại", checking: "Đang so sánh điều kiện công khai...", description: "So sánh hồ sơ tạm thời với Rule chính thức đã kiểm duyệt.", noProfile: "Hồ sơ tạm thời không tồn tại hoặc đã hết hạn.", create: "Nhập hồ sơ", error: "Không thể hoàn tất kiểm tra. Vui lòng thử lại sau.", status: { PUBLIC_CONDITIONS_MET: "Đáp ứng điều kiện công khai", NEED_BANK_CONFIRMATION: "Cần ngân hàng xác nhận", PUBLIC_CONDITIONS_NOT_MET: "Không đáp ứng điều kiện công khai", INSUFFICIENT_INFORMATION: "Thiếu thông tin" }, final: "Đây không phải phê duyệt cuối cùng.", passed: "Điều kiện đã đạt", failed: "Điều kiện chưa đạt", external: "Ngân hàng cần xác nhận", unknown: "Điều kiện không công khai", insufficient: "Thông tin còn thiếu", empty: "Không có mục nào.", source: "Nguồn", checked: "Ngày xác nhận", locator: "Vị trí căn cứ", ruleTitle: "Điều kiện sản phẩm đã duyệt", noRules: "Không có Rule đã duyệt đang có hiệu lực.", required: "Bắt buộc", optional: "Tùy chọn", summary: "Tóm tắt sản phẩm", public: "Điều kiện công khai", additional: "Điều kiện cần xác nhận", base: "Ngày thông tin", officialLink: "Mở trang chính thức" },
  zh: { back: "产品列表", tabs: { precheck: "资格预检", evidence: "判断依据", documents: "所需材料", steps: "申请流程", official: "官方信息" }, run: "用我的资料确认资格", rerun: "重新诊断", checking: "正在比较公开条件…", description: "将已保存的临时资料与已审核的官方规则进行比较。", noProfile: "临时资料不存在或已过期。", create: "填写资料", error: "未能完成诊断，请稍后再试。", status: { PUBLIC_CONDITIONS_MET: "满足公开条件", NEED_BANK_CONFIRMATION: "需银行确认", PUBLIC_CONDITIONS_NOT_MET: "未满足公开条件", INSUFFICIENT_INFORMATION: "信息不足" }, final: "这并非最终的加入批准。", passed: "已满足的条件", failed: "未满足的条件", external: "需银行确认的条件", unknown: "未公开的条件", insufficient: "缺少的信息", empty: "没有相关项目。", source: "来源", checked: "确认日期", locator: "依据位置", ruleTitle: "已审核的产品条件", noRules: "目前没有有效的已审核规则。", required: "必填", optional: "选填", summary: "产品概要", public: "公开条件", additional: "额外确认条件", base: "信息基准日", officialLink: "打开官方页面" },
  ja: { back: "商品一覧", tabs: { precheck: "事前診断", evidence: "判断根拠", documents: "必要書類", steps: "申請手続き", official: "公式情報" }, run: "自分のプロフィールで事前資格を確認", rerun: "もう一度診断", checking: "公開条件を比較しています…", description: "保存された一時プロフィールと審査済みの公式ルールを比較します。", noProfile: "一時プロフィールがないか、有効期限が切れています。", create: "プロフィール入力", error: "診断を完了できませんでした。しばらくしてからもう一度お試しください。", status: { PUBLIC_CONDITIONS_MET: "公開条件を満たす", NEED_BANK_CONFIRMATION: "銀行の確認が必要", PUBLIC_CONDITIONS_NOT_MET: "公開条件を満たさない", INSUFFICIENT_INFORMATION: "情報不足" }, final: "最終的な加入承認ではありません。", passed: "満たしている条件", failed: "満たしていない条件", external: "銀行確認が必要な条件", unknown: "公開されていない条件", insufficient: "不足している情報", empty: "該当する項目はありません。", source: "出典", checked: "確認日", locator: "根拠の位置", ruleTitle: "審査済みの商品条件", noRules: "現在有効な承認済みルールはありません。", required: "必須", optional: "任意", summary: "商品概要", public: "公開条件", additional: "追加確認条件", base: "情報基準日", officialLink: "公式ページを開く" },
  th: { back: "รายการผลิตภัณฑ์", tabs: { precheck: "ตรวจสอบเบื้องต้น", evidence: "หลักฐานประกอบ", documents: "เอกสารที่ต้องใช้", steps: "ขั้นตอนการสมัคร", official: "ข้อมูลอย่างเป็นทางการ" }, run: "ตรวจคุณสมบัติด้วยโปรไฟล์ของฉัน", rerun: "ตรวจสอบอีกครั้ง", checking: "กำลังเปรียบเทียบเงื่อนไขสาธารณะ...", description: "เปรียบเทียบโปรไฟล์ชั่วคราวที่บันทึกไว้กับกฎอย่างเป็นทางการที่ตรวจสอบแล้ว", noProfile: "ไม่พบโปรไฟล์ชั่วคราวหรือหมดอายุแล้ว", create: "กรอกโปรไฟล์", error: "ไม่สามารถตรวจสอบให้เสร็จสิ้นได้ กรุณาลองใหม่อีกครั้ง", status: { PUBLIC_CONDITIONS_MET: "ผ่านเงื่อนไขสาธารณะ", NEED_BANK_CONFIRMATION: "ต้องให้ธนาคารยืนยัน", PUBLIC_CONDITIONS_NOT_MET: "ไม่ผ่านเงื่อนไขสาธารณะ", INSUFFICIENT_INFORMATION: "ข้อมูลไม่เพียงพอ" }, final: "นี่ไม่ใช่การอนุมัติขั้นสุดท้าย", passed: "เงื่อนไขที่ผ่าน", failed: "เงื่อนไขที่ไม่ผ่าน", external: "เงื่อนไขที่ต้องให้ธนาคารยืนยัน", unknown: "เงื่อนไขที่ไม่เปิดเผย", insufficient: "ข้อมูลที่ขาดหาย", empty: "ไม่มีรายการในส่วนนี้", source: "แหล่งที่มา", checked: "วันที่ตรวจสอบ", locator: "ตำแหน่งหลักฐาน", ruleTitle: "เงื่อนไขผลิตภัณฑ์ที่ตรวจสอบแล้ว", noRules: "ขณะนี้ไม่มีกฎที่อนุมัติและมีผลบังคับใช้", required: "จำเป็น", optional: "ไม่บังคับ", summary: "สรุปผลิตภัณฑ์", public: "เงื่อนไขสาธารณะ", additional: "เงื่อนไขที่ต้องยืนยันเพิ่ม", base: "วันที่อ้างอิงข้อมูล", officialLink: "เปิดหน้าอย่างเป็นทางการ" },
} as const;
const dynamicCopy = {
  ko: { title: "이 상품 진단에 추가 정보가 필요합니다", description: "이 상품의 검수된 조건에 필요한 항목만 요청합니다. 답변은 24시간 임시 프로필에 저장됩니다.", save: "저장하고 진단하기", saving: "저장 중...", error: "추가 정보를 저장하지 못했습니다.", choose: "선택하세요", yes: "예", no: "아니요", fields: { hasExistingProductAccount: "현재 동일 상품 계좌를 보유하고 있나요?", desiredMonthlyAmount: "월 납입 희망액 (원)", hasBankAccount: "한국 은행계좌를 보유하고 있나요?", housingType: "주거 형태", desiredAmount: "희망 금액 (원)", preferredBank: "선호 은행" } },
  en: { title: "More information is needed for this product", description: "We ask only for fields required by this product's reviewed rules. Answers are stored in your 24-hour temporary profile.", save: "Save and run pre-check", saving: "Saving...", error: "Could not save the additional information.", choose: "Select", yes: "Yes", no: "No", fields: { hasExistingProductAccount: "Do you already hold this product account?", desiredMonthlyAmount: "Desired monthly amount (KRW)", hasBankAccount: "Do you have a Korean bank account?", housingType: "Housing type", desiredAmount: "Desired amount (KRW)", preferredBank: "Preferred bank" } },
  vi: { title: "Cần thêm thông tin cho sản phẩm này", description: "Chúng tôi chỉ hỏi các mục cần thiết cho quy tắc đã kiểm duyệt của sản phẩm. Câu trả lời được lưu trong hồ sơ tạm thời 24 giờ.", save: "Lưu và kiểm tra", saving: "Đang lưu...", error: "Không thể lưu thông tin bổ sung.", choose: "Chọn", yes: "Có", no: "Không", fields: { hasExistingProductAccount: "Bạn đã có tài khoản của sản phẩm này chưa?", desiredMonthlyAmount: "Số tiền hàng tháng mong muốn (KRW)", hasBankAccount: "Bạn có tài khoản ngân hàng Hàn Quốc không?", housingType: "Hình thức nhà ở", desiredAmount: "Số tiền mong muốn (KRW)", preferredBank: "Ngân hàng ưu tiên" } },
  zh: { title: "该产品的诊断需要补充信息", description: "仅询问该产品已审核条件所需的项目。回答将保存在 24 小时临时资料中。", save: "保存并诊断", saving: "保存中…", error: "未能保存补充信息。", choose: "请选择", yes: "是", no: "否", fields: { hasExistingProductAccount: "您目前是否持有该产品账户？", desiredMonthlyAmount: "每月希望存入金额（韩元）", hasBankAccount: "您是否持有韩国银行账户？", housingType: "居住形式", desiredAmount: "希望金额（韩元）", preferredBank: "偏好银行" } },
  ja: { title: "この商品の診断には追加情報が必要です", description: "この商品の審査済み条件に必要な項目のみお尋ねします。回答は24時間の一時プロフィールに保存されます。", save: "保存して診断する", saving: "保存中…", error: "追加情報を保存できませんでした。", choose: "選択してください", yes: "はい", no: "いいえ", fields: { hasExistingProductAccount: "現在この商品の口座をお持ちですか？", desiredMonthlyAmount: "月々の希望積立額（ウォン）", hasBankAccount: "韓国の銀行口座をお持ちですか？", housingType: "住居形態", desiredAmount: "希望金額（ウォン）", preferredBank: "希望する銀行" } },
  th: { title: "การตรวจสอบผลิตภัณฑ์นี้ต้องการข้อมูลเพิ่มเติม", description: "เราถามเฉพาะรายการที่จำเป็นตามกฎที่ตรวจสอบแล้วของผลิตภัณฑ์นี้ คำตอบจะถูกเก็บในโปรไฟล์ชั่วคราว 24 ชั่วโมง", save: "บันทึกและตรวจสอบ", saving: "กำลังบันทึก...", error: "ไม่สามารถบันทึกข้อมูลเพิ่มเติมได้", choose: "กรุณาเลือก", yes: "ใช่", no: "ไม่ใช่", fields: { hasExistingProductAccount: "คุณมีบัญชีผลิตภัณฑ์นี้อยู่แล้วหรือไม่?", desiredMonthlyAmount: "จำนวนเงินฝากรายเดือนที่ต้องการ (วอน)", hasBankAccount: "คุณมีบัญชีธนาคารเกาหลีหรือไม่?", housingType: "รูปแบบที่อยู่อาศัย", desiredAmount: "จำนวนเงินที่ต้องการ (วอน)", preferredBank: "ธนาคารที่ต้องการ" } },
} as const;
const dynamicFieldKeys = ["birthDate", "visaType", "visaExpiry", "residencyStartDate", "occupation", "employmentType", "monthlyIncome", "employmentDurationMonths", "residentStatus", "hasExistingProductAccount", "desiredMonthlyAmount", "hasBankAccount", "hasKoreanBankAccount", "hasResidenceCard", "hasPassport", "hasDomesticPhone", "canDomesticPhoneVerify", "hasKoreanCreditHistory", "preferredChannel", "remittanceCountry", "housingType", "desiredAmount", "preferredBank"] as const;
type DynamicFieldKey = (typeof dynamicFieldKeys)[number];
type ProfileIdentity = { id: number; sessionId: string };
const tabs: Tab[] = ["precheck", "evidence", "documents", "steps", "official"];
const statusStyle: Record<EligibilityStatus, string> = { PUBLIC_CONDITIONS_MET: "border-status-success-border bg-status-success-bg text-status-success", NEED_BANK_CONFIRMATION: "border-status-warning-border bg-status-warning-bg text-status-warning", PUBLIC_CONDITIONS_NOT_MET: "border-status-danger-border bg-status-danger-bg text-status-danger", INSUFFICIENT_INFORMATION: "border-status-neutral-border bg-status-neutral-bg text-status-neutral" };
const statusIcon: Record<EligibilityStatus, string> = { PUBLIC_CONDITIONS_MET: "●", NEED_BANK_CONFIRMATION: "▲", PUBLIC_CONDITIONS_NOT_MET: "×", INSUFFICIENT_INFORMATION: "○" };
const readinessLabels = {
  ko: { READY: "진단 준비 완료", PARTIAL: "일부 조건 확인 가능", NOT_READY: "공식 정보 보완 중" },
  en: { READY: "Ready for pre-check", PARTIAL: "Some conditions can be checked", NOT_READY: "Official information being updated" },
  vi: { READY: "Sẵn sàng kiểm tra", PARTIAL: "Có thể kiểm tra một phần", NOT_READY: "Đang bổ sung thông tin chính thức" },
  zh: { READY: "可进行诊断", PARTIAL: "可确认部分条件", NOT_READY: "官方信息补充中" },
  ja: { READY: "診断の準備完了", PARTIAL: "一部の条件を確認可能", NOT_READY: "公式情報を補完中" },
  th: { READY: "พร้อมตรวจสอบ", PARTIAL: "ตรวจสอบได้บางเงื่อนไข", NOT_READY: "กำลังเพิ่มเติมข้อมูลอย่างเป็นทางการ" },
} as const;
const ruleLevelLabels = {
  ko: { HARD: "공개 필수조건", EXTERNAL_CHECK: "은행 확인사항", UNKNOWN: "공개되지 않은 조건" },
  en: { HARD: "Public required condition", EXTERNAL_CHECK: "Bank confirmation", UNKNOWN: "Unpublished condition" },
  vi: { HARD: "Điều kiện công khai bắt buộc", EXTERNAL_CHECK: "Cần ngân hàng xác nhận", UNKNOWN: "Điều kiện chưa công khai" },
  zh: { HARD: "公开必备条件", EXTERNAL_CHECK: "银行确认事项", UNKNOWN: "未公开的条件" },
  ja: { HARD: "公開の必須条件", EXTERNAL_CHECK: "銀行の確認事項", UNKNOWN: "公開されていない条件" },
  th: { HARD: "เงื่อนไขบังคับที่เปิดเผย", EXTERNAL_CHECK: "รายการที่ธนาคารต้องยืนยัน", UNKNOWN: "เงื่อนไขที่ไม่เปิดเผย" },
} as const;

export function ProductDetailDashboard() {
  const { locale } = useLocale(); const uiLocale = locale; const text = copy[uiLocale]; const params = useParams<{ id: string }>(); const search = useSearchParams(); const id = Number(params.id);
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
    <header className="ui-card mt-4 p-6 sm:p-8"><div className="flex flex-wrap items-center gap-3"><span className="rounded-full border border-line bg-surface-subtle px-3 py-1 text-xs font-semibold text-muted">{readinessLabels[uiLocale][item.diagnosisStatus]}</span><span className="text-sm font-semibold text-brand">{item.institution}</span></div><h1 className="mt-4 text-3xl font-bold leading-tight text-ink sm:text-4xl">{item.productName}</h1><p className="mt-4 max-w-reading text-base leading-7 text-muted">{item.description}</p></header>
    <OfficialContentChangeNotice trust={item.sourceTrust} locale={uiLocale} />
    <nav className="sticky top-16 z-20 mt-6 overflow-x-auto rounded-card border border-line bg-surface p-1.5 shadow-card" aria-label="Product detail tabs" role="tablist"><div className="flex min-w-max gap-1">{tabs.map((tab) => <button aria-selected={activeTab === tab} className={`min-h-11 rounded-control border px-4 py-2.5 text-sm font-semibold transition duration-200 ${activeTab === tab ? "border-brand bg-brand-soft text-brand" : "border-transparent text-muted hover:bg-surface-subtle hover:text-ink"}`} key={tab} onClick={() => setActiveTab(tab)} role="tab" type="button">{text.tabs[tab]}</button>)}</div></nav>

    {activeTab === "precheck" ? <section className="mt-6" role="tabpanel"><div className="rounded-panel border border-status-info-border bg-status-info-bg p-6 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-5"><div className="max-w-reading"><h2 className="text-2xl font-bold text-ink">{text.run}</h2><p className="mt-2 text-sm leading-6 text-muted">{text.description}</p></div><button className="ui-button ui-button-primary min-h-12" disabled={precheck.isPending || profile.isFetching || profileIdentity === undefined} onClick={run}>{precheck.isPending || profile.isFetching ? text.checking : precheck.data ? text.rerun : text.run}</button></div></div>
      {additionalRequested && profile.data && missingFields.length ? <DynamicProfileFields fields={missingFields} locale={uiLocale} pending={profileUpdate.isPending} error={profileUpdate.isError} onSubmit={(changes) => profileUpdate.mutate(changes)} /> : null}
      {precheck.isPending ? <div className="mt-5"><AnalysisProgress /></div> : null}
      {precheck.data && !evidenceDone ? <div className="mt-5"><AnalysisProgress recommendationDone evidenceRequested evidenceDone={false} /></div> : null}
      {missingProfile ? <div className="ui-alert-warning mt-5 flex flex-wrap items-center justify-between gap-3"><p>{text.noProfile}</p><Link className="ui-button ui-button-primary" href="/profile">{text.create} →</Link></div> : null}
      {precheck.isError && !missingProfile ? <p className="ui-alert-danger mt-5" role="alert">{text.error}</p> : null}
      {precheck.data ? <PrecheckResult locale={uiLocale} result={precheck.data} rules={item.rules} sourceTitle={item.sourceTitle} text={text} /> : null}
      {precheck.data ? <div id="bank-inquiry"><AiExplanationPanel data={explanation.data} loading={explanation.isPending} error={explanation.isError} /></div> : null}
    </section> : null}
    {activeTab === "evidence" ? <section className="mt-6" role="tabpanel"><RuleEvidence rules={item.rules} sourceTitle={item.sourceTitle} text={text} /><RagQuestionPanel productId={item.id} rules={item.rules} /></section> : null}
    {activeTab === "documents" ? <section className="mt-6" role="tabpanel"><ProductGuidancePanel guidance={currentGuidance} sourceUrl={item.sourceUrl} loading={guidance.isLoading || personalized.isPending} view="documents" /></section> : null}
    {activeTab === "steps" ? <section className="mt-6" role="tabpanel"><ProductGuidancePanel guidance={currentGuidance} sourceUrl={item.sourceUrl} loading={guidance.isLoading || personalized.isPending} view="steps" /></section> : null}
    {activeTab === "official" ? <section className="mt-6 grid gap-5 sm:grid-cols-2" role="tabpanel"><Info title={text.summary} body={item.targetSummary} /><Info title={text.public} body={item.publicConditions} /><Info title={text.additional} body={item.additionalConditions} /><article className="ui-card p-6"><p className="text-xs font-semibold text-brand">{text.source}</p><h2 className="mt-2 font-bold text-ink">{item.sourceTitle}</h2><p className="mt-3 text-sm text-muted">{text.base}: {item.informationBaseDate}</p><p className="mt-2 text-xs text-muted">Last reviewed: {new Date(item.sourceTrust.lastVerifiedAt).toLocaleDateString()} · Evidence {item.sourceTrust.evidenceCoveragePercent}%</p><div className="mt-5 flex flex-wrap gap-2"><a className="ui-button ui-button-secondary" href={item.sourceUrl} rel="noreferrer" target="_blank">{text.officialLink} ↗</a>{item.officialApplicationUrl ? <a className="ui-button ui-button-primary" href={item.officialApplicationUrl} rel="noreferrer" target="_blank">Official application ↗</a> : null}</div></article></section> : null}
    <p className="ui-alert-warning mt-8 text-center font-semibold">{text.final}</p>
  </main>;
}

const contentChangeNotice: Record<Locale, { title: string; body: string; date: string }> = {
  ko: { title: "이 상품의 공식 정보가 변경되었습니다", body: "금융기관이 공식 페이지를 수정해 기존 근거를 재검수 중입니다. 아래 진단 결과는 이전 검수본 기준이므로 공식 페이지에서 최신 조건을 함께 확인해 주세요.", date: "변경 확인일" },
  en: { title: "This product's official information has changed", body: "The institution updated its official page, so the previous evidence is being re-reviewed. The result below reflects the earlier reviewed snapshot — please also check the official page for current conditions.", date: "Change detected" },
  vi: { title: "Thông tin chính thức của sản phẩm này đã thay đổi", body: "Tổ chức tài chính đã cập nhật trang chính thức nên căn cứ trước đó đang được kiểm duyệt lại. Kết quả bên dưới dựa trên bản đã duyệt trước đó, vui lòng kiểm tra thêm điều kiện mới nhất trên trang chính thức.", date: "Ngày phát hiện thay đổi" },
  zh: { title: "该产品的官方信息已变更", body: "金融机构修改了官方页面，原有依据正在重新审核。下方结果基于此前的审核版本，请同时在官方页面确认最新条件。", date: "变更确认日" },
  ja: { title: "この商品の公式情報が変更されました", body: "金融機関が公式ページを更新したため、これまでの根拠を再審査中です。以下の結果は以前の審査時点のものです。公式ページで最新の条件もあわせてご確認ください。", date: "変更確認日" },
  th: { title: "ข้อมูลอย่างเป็นทางการของผลิตภัณฑ์นี้มีการเปลี่ยนแปลง", body: "สถาบันการเงินได้แก้ไขหน้าอย่างเป็นทางการ จึงกำลังตรวจสอบหลักฐานเดิมอีกครั้ง ผลลัพธ์ด้านล่างอ้างอิงฉบับที่ตรวจสอบก่อนหน้า กรุณาตรวจสอบเงื่อนไขล่าสุดจากหน้าอย่างเป็นทางการด้วย", date: "วันที่ตรวจพบการเปลี่ยนแปลง" },
};

function OfficialContentChangeNotice({ trust, locale }: { trust: FinancialProduct["sourceTrust"]; locale: Locale }) {
  if (!trust.officialContentChanged) return null;
  const notice = contentChangeNotice[locale];
  return (
    <section className="ui-alert-warning mt-6" role="status">
      <p className="font-bold">{notice.title}</p>
      <p className="mt-1.5 text-sm leading-6">{notice.body}</p>
      {trust.officialContentChangedAt ? (
        <p className="mt-2 text-xs font-semibold">
          {notice.date}: {new Date(trust.officialContentChangedAt).toLocaleDateString()}
        </p>
      ) : null}
    </section>
  );
}

const precheckHeadings: Record<Locale, string> = {
  ko: "사전자격 안내",
  en: "Pre-check result",
  vi: "Kết quả kiểm tra sơ bộ",
  zh: "资格预检结果",
  ja: "事前資格のご案内",
  th: "ผลการตรวจสอบคุณสมบัติเบื้องต้น",
};

const accessLabels = {
  ko: { title: "금융서비스 이용방법", eligibility: "가입조건과 앱·영업점 이용 가능 여부는 별도입니다.", id: "신분확인", branch: "영업점", online: "모바일·온라인", source: "공식 근거", guard: "'실명의 개인' 문구만으로 외국인 이용 가능을 판단하지 않았습니다.", status: { ACCESS_READY: "이용방법 확인", ACCESS_READY_BRANCH_ONLY: "영업점 이용 확인", ACCESS_READY_ONLINE: "온라인 이용 확인", ACCESS_ADDITIONAL_DOCUMENTS: "추가서류 필요", ACCESS_NEED_CONFIRMATION: "금융기관 확인 필요", ACCESS_UNKNOWN: "이용방법 확인 필요" }, availability: { AVAILABLE: "공식자료 확인", NEED_CONFIRMATION: "금융기관 확인 필요", NOT_AVAILABLE: "이용 불가 명시", UNKNOWN: "공식자료 미확인" } },
  en: { title: "How you can access this service", eligibility: "Eligibility and app/branch access are assessed separately.", id: "Identification", branch: "Branch", online: "Mobile / online", source: "Official evidence", guard: "We did not infer foreign-customer access from 'real-name individual' alone.", status: { ACCESS_READY: "Access method confirmed", ACCESS_READY_BRANCH_ONLY: "Branch access confirmed", ACCESS_READY_ONLINE: "Online access confirmed", ACCESS_ADDITIONAL_DOCUMENTS: "Additional documents needed", ACCESS_NEED_CONFIRMATION: "Confirmation needed", ACCESS_UNKNOWN: "Access method unknown" }, availability: { AVAILABLE: "Confirmed by official source", NEED_CONFIRMATION: "Confirmation needed", NOT_AVAILABLE: "Officially unavailable", UNKNOWN: "Not found in official sources" } },
  vi: { title: "Cách sử dụng dịch vụ", eligibility: "Điều kiện và khả năng dùng ứng dụng/chi nhánh được đánh giá riêng.", id: "Xác minh danh tính", branch: "Chi nhánh", online: "Di động / trực tuyến", source: "Căn cứ chính thức", guard: "Không suy luận người nước ngoài có thể sử dụng chỉ từ cụm từ về danh tính thực.", status: { ACCESS_READY: "Đã xác nhận cách sử dụng", ACCESS_READY_BRANCH_ONLY: "Đã xác nhận tại chi nhánh", ACCESS_READY_ONLINE: "Đã xác nhận trực tuyến", ACCESS_ADDITIONAL_DOCUMENTS: "Cần thêm giấy tờ", ACCESS_NEED_CONFIRMATION: "Cần tổ chức xác nhận", ACCESS_UNKNOWN: "Chưa rõ cách sử dụng" }, availability: { AVAILABLE: "Đã xác nhận từ nguồn chính thức", NEED_CONFIRMATION: "Cần xác nhận", NOT_AVAILABLE: "Chính thức không khả dụng", UNKNOWN: "Chưa có trong nguồn chính thức" } },
  zh: { title: "该金融服务的使用方式", eligibility: "加入条件与 App／营业网点的可用性是分开评估的。", id: "身份确认", branch: "营业网点", online: "手机・线上", source: "官方依据", guard: "并未仅凭“实名个人”这一表述判断外国人可以使用。", status: { ACCESS_READY: "已确认使用方式", ACCESS_READY_BRANCH_ONLY: "已确认可在网点办理", ACCESS_READY_ONLINE: "已确认可线上办理", ACCESS_ADDITIONAL_DOCUMENTS: "需要补充材料", ACCESS_NEED_CONFIRMATION: "需金融机构确认", ACCESS_UNKNOWN: "需确认使用方式" }, availability: { AVAILABLE: "官方资料已确认", NEED_CONFIRMATION: "需金融机构确认", NOT_AVAILABLE: "明示不可使用", UNKNOWN: "官方资料未确认" } },
  ja: { title: "この金融サービスの利用方法", eligibility: "加入条件とアプリ・店舗の利用可否は別々に判断します。", id: "本人確認", branch: "店舗", online: "モバイル・オンライン", source: "公式根拠", guard: "「実名の個人」という表現だけで外国人の利用可否を判断していません。", status: { ACCESS_READY: "利用方法を確認", ACCESS_READY_BRANCH_ONLY: "店舗での利用を確認", ACCESS_READY_ONLINE: "オンライン利用を確認", ACCESS_ADDITIONAL_DOCUMENTS: "追加書類が必要", ACCESS_NEED_CONFIRMATION: "金融機関の確認が必要", ACCESS_UNKNOWN: "利用方法の確認が必要" }, availability: { AVAILABLE: "公式資料で確認", NEED_CONFIRMATION: "金融機関の確認が必要", NOT_AVAILABLE: "利用不可と明示", UNKNOWN: "公式資料で未確認" } },
  th: { title: "วิธีใช้บริการทางการเงินนี้", eligibility: "เงื่อนไขการสมัครกับความสามารถในการใช้แอป/สาขา ประเมินแยกจากกัน", id: "การยืนยันตัวตน", branch: "สาขา", online: "มือถือ・ออนไลน์", source: "หลักฐานอย่างเป็นทางการ", guard: "ไม่ได้สรุปว่าชาวต่างชาติใช้บริการได้จากข้อความ 'บุคคลที่ยืนยันตัวตนจริง' เพียงอย่างเดียว", status: { ACCESS_READY: "ยืนยันวิธีใช้บริการแล้ว", ACCESS_READY_BRANCH_ONLY: "ยืนยันการใช้บริการที่สาขาแล้ว", ACCESS_READY_ONLINE: "ยืนยันการใช้บริการออนไลน์แล้ว", ACCESS_ADDITIONAL_DOCUMENTS: "ต้องใช้เอกสารเพิ่มเติม", ACCESS_NEED_CONFIRMATION: "ต้องให้สถาบันการเงินยืนยัน", ACCESS_UNKNOWN: "ต้องยืนยันวิธีใช้บริการ" }, availability: { AVAILABLE: "ยืนยันจากเอกสารอย่างเป็นทางการ", NEED_CONFIRMATION: "ต้องให้สถาบันการเงินยืนยัน", NOT_AVAILABLE: "ระบุชัดว่าใช้ไม่ได้", UNKNOWN: "ยังไม่ยืนยันจากเอกสารอย่างเป็นทางการ" } },
} as const;

const dynamicFieldLabels: Record<Locale, Record<DynamicFieldKey, string>> = {
  ko: { birthDate: "생년월일", visaType: "비자 종류", visaExpiry: "비자 만료일", residencyStartDate: "한국 체류 시작일", occupation: "직업", employmentType: "고용형태", monthlyIncome: "월 소득 (원)", employmentDurationMonths: "근속기간 (개월)", residentStatus: "거주자 구분", hasExistingProductAccount: "기존 동일상품 계좌 보유", desiredMonthlyAmount: "월 희망 납입액", hasBankAccount: "한국 계좌 보유", hasKoreanBankAccount: "한국 입출금계좌 보유", hasResidenceCard: "체류카드 보유", hasPassport: "여권 보유", hasDomesticPhone: "국내 휴대전화 보유", canDomesticPhoneVerify: "휴대전화 본인인증 가능", hasKoreanCreditHistory: "한국 신용이력 보유", preferredChannel: "선호 신청채널", remittanceCountry: "송금 대상 국가", housingType: "주거 형태", desiredAmount: "희망 금액", preferredBank: "선호 은행" },
  en: { birthDate: "Date of birth", visaType: "Visa type", visaExpiry: "Visa expiry date", residencyStartDate: "Date residency in Korea began", occupation: "Occupation", employmentType: "Employment type", monthlyIncome: "Monthly income (KRW)", employmentDurationMonths: "Employment duration (months)", residentStatus: "Resident status", hasExistingProductAccount: "Existing account for this product", desiredMonthlyAmount: "Desired monthly amount", hasBankAccount: "Korean bank account", hasKoreanBankAccount: "Korean demand-deposit account", hasResidenceCard: "Residence card", hasPassport: "Passport", hasDomesticPhone: "Korean mobile phone", canDomesticPhoneVerify: "Phone identity verification available", hasKoreanCreditHistory: "Korean credit history", preferredChannel: "Preferred application channel", remittanceCountry: "Remittance destination country", housingType: "Housing type", desiredAmount: "Desired amount", preferredBank: "Preferred bank" },
  vi: { birthDate: "Ngày sinh", visaType: "Loại visa", visaExpiry: "Ngày hết hạn visa", residencyStartDate: "Ngày bắt đầu cư trú tại Hàn Quốc", occupation: "Nghề nghiệp", employmentType: "Hình thức việc làm", monthlyIncome: "Thu nhập hàng tháng (KRW)", employmentDurationMonths: "Thời gian làm việc (tháng)", residentStatus: "Tình trạng cư trú", hasExistingProductAccount: "Đã có tài khoản sản phẩm này", desiredMonthlyAmount: "Số tiền gửi hàng tháng mong muốn", hasBankAccount: "Có tài khoản ngân hàng Hàn Quốc", hasKoreanBankAccount: "Có tài khoản thanh toán Hàn Quốc", hasResidenceCard: "Có thẻ cư trú", hasPassport: "Có hộ chiếu", hasDomesticPhone: "Có điện thoại Hàn Quốc", canDomesticPhoneVerify: "Có thể xác minh bằng điện thoại", hasKoreanCreditHistory: "Có lịch sử tín dụng Hàn Quốc", preferredChannel: "Kênh đăng ký ưu tiên", remittanceCountry: "Quốc gia nhận chuyển tiền", housingType: "Hình thức nhà ở", desiredAmount: "Số tiền mong muốn", preferredBank: "Ngân hàng ưu tiên" },
  zh: { birthDate: "出生日期", visaType: "签证种类", visaExpiry: "签证到期日", residencyStartDate: "在韩居留开始日", occupation: "职业", employmentType: "雇佣形式", monthlyIncome: "月收入（韩元）", employmentDurationMonths: "在职期间（月）", residentStatus: "居住者身份", hasExistingProductAccount: "已持有同一产品账户", desiredMonthlyAmount: "每月希望存入金额", hasBankAccount: "持有韩国账户", hasKoreanBankAccount: "持有韩国活期存款账户", hasResidenceCard: "持有居留卡", hasPassport: "持有护照", hasDomesticPhone: "持有韩国手机", canDomesticPhoneVerify: "可用手机进行本人认证", hasKoreanCreditHistory: "有韩国信用记录", preferredChannel: "偏好申请渠道", remittanceCountry: "汇款目的国", housingType: "居住形式", desiredAmount: "希望金额", preferredBank: "偏好银行" },
  ja: { birthDate: "生年月日", visaType: "ビザの種類", visaExpiry: "ビザ有効期限", residencyStartDate: "韓国滞在の開始日", occupation: "職業", employmentType: "雇用形態", monthlyIncome: "月収（ウォン）", employmentDurationMonths: "勤続期間（か月）", residentStatus: "居住者区分", hasExistingProductAccount: "同一商品の口座を保有", desiredMonthlyAmount: "月々の希望積立額", hasBankAccount: "韓国の銀行口座を保有", hasKoreanBankAccount: "韓国の普通預金口座を保有", hasResidenceCard: "在留カードを保有", hasPassport: "パスポートを保有", hasDomesticPhone: "韓国の携帯電話を保有", canDomesticPhoneVerify: "携帯電話で本人認証が可能", hasKoreanCreditHistory: "韓国での信用履歴あり", preferredChannel: "希望する申請チャネル", remittanceCountry: "送金先の国", housingType: "住居形態", desiredAmount: "希望金額", preferredBank: "希望する銀行" },
  th: { birthDate: "วันเกิด", visaType: "ประเภทวีซ่า", visaExpiry: "วันหมดอายุวีซ่า", residencyStartDate: "วันที่เริ่มพำนักในเกาหลี", occupation: "อาชีพ", employmentType: "รูปแบบการจ้างงาน", monthlyIncome: "รายได้ต่อเดือน (วอน)", employmentDurationMonths: "ระยะเวลาทำงาน (เดือน)", residentStatus: "สถานะผู้พำนัก", hasExistingProductAccount: "มีบัญชีผลิตภัณฑ์เดียวกันอยู่แล้ว", desiredMonthlyAmount: "จำนวนเงินฝากรายเดือนที่ต้องการ", hasBankAccount: "มีบัญชีธนาคารเกาหลี", hasKoreanBankAccount: "มีบัญชีเงินฝากกระแสรายวันของเกาหลี", hasResidenceCard: "มีบัตรพำนัก", hasPassport: "มีหนังสือเดินทาง", hasDomesticPhone: "มีโทรศัพท์มือถือเกาหลี", canDomesticPhoneVerify: "ยืนยันตัวตนด้วยโทรศัพท์ได้", hasKoreanCreditHistory: "มีประวัติเครดิตในเกาหลี", preferredChannel: "ช่องทางการสมัครที่ต้องการ", remittanceCountry: "ประเทศปลายทางการโอนเงิน", housingType: "รูปแบบที่อยู่อาศัย", desiredAmount: "จำนวนเงินที่ต้องการ", preferredBank: "ธนาคารที่ต้องการ" },
};

function PrecheckResult({ locale, result, rules, sourceTitle, text }: { locale: Locale; result: EligibilityResult; rules: ProductRule[]; sourceTitle: string; text: (typeof copy)[keyof typeof copy] }) { const heading = precheckHeadings[locale]; return <section className="mt-6 space-y-5" aria-live="polite"><header className={`rounded-panel border p-6 sm:p-7 ${statusStyle[result.status]}`}><p className="text-xs font-bold tracking-wider">{heading}</p><h2 className="mt-2 text-2xl font-bold"><span className="mr-2" aria-hidden>{statusIcon[result.status]}</span>{text.status[result.status]}</h2><p className="mt-3 text-sm font-semibold">{result.disclaimer}</p></header><AccessPanel access={result.accessAssessment} locale={locale} /><div className="grid gap-5 lg:grid-cols-2"><ResultGroup title={text.passed} items={result.passedRules} tone="emerald" rules={rules} sourceTitle={sourceTitle} text={text} /><ResultGroup title={text.failed} items={result.failedRules} tone="rose" rules={rules} sourceTitle={sourceTitle} text={text} /><ResultGroup title={text.external} items={result.externalChecks} tone="amber" rules={rules} sourceTitle={sourceTitle} text={text} /><ResultGroup title={text.unknown} items={result.unknownRules} tone="violet" rules={rules} sourceTitle={sourceTitle} text={text} /><ResultGroup title={text.insufficient} items={result.insufficientReasons} tone="slate" rules={rules} sourceTitle={sourceTitle} text={text} /></div><p className="ui-alert-warning">{result.disclaimer}</p></section>; }

function AccessPanel({ access, locale }: { access: EligibilityResult["accessAssessment"]; locale: Locale }) {
  const labels = accessLabels[locale];
  const availability = (value: string) => value === "AVAILABLE" ? "✓" : value === "NOT_AVAILABLE" ? "×" : value === "NEED_CONFIRMATION" ? "!" : "?";
  const accessItems: Array<[string, AccessAvailability]> = [[labels.id, access.identification], [labels.branch, access.branch], [labels.online, access.online]];
  return <section className="ui-card p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="ui-eyebrow">{labels.status[access.status]}</p><h3 className="mt-2 text-xl font-bold text-ink">{labels.title}</h3><p className="mt-2 text-sm text-muted">{labels.eligibility}</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3">{accessItems.map(([label, value]) => <div className="rounded-control border border-line bg-surface-subtle p-4" key={label}><p className="text-xs font-semibold text-muted">{label}</p><p className="mt-2 font-bold text-ink"><span className="mr-2" aria-hidden>{availability(value)}</span>{labels.availability[value]}</p></div>)}</div>{access.realNameGuardrailApplied ? <p className="ui-alert-warning mt-4">{labels.guard}</p> : null}{access.details.length ? <div className="mt-4 space-y-2">{access.details.map((detail, index) => <article className="rounded-control border border-line p-3" key={`${detail.key}-${index}`}><p className="text-sm font-semibold text-ink">{detail.message}</p>{detail.sourceExcerpt ? <blockquote className="mt-2 border-l-2 border-line-strong pl-3 text-xs text-muted">{detail.sourceExcerpt}</blockquote> : null}{detail.sourceUrl ? <a className="ui-link mt-2 inline-flex text-xs" href={detail.sourceUrl} rel="noreferrer" target="_blank">{labels.source} ↗</a> : null}</article>)}</div> : null}</section>;
}
const tones = { emerald: "border-status-success-border bg-status-success-bg", rose: "border-status-danger-border bg-status-danger-bg", amber: "border-status-warning-border bg-status-warning-bg", violet: "border-status-neutral-border bg-status-neutral-bg", slate: "border-status-neutral-border bg-status-neutral-bg" } as const;
function ResultGroup({ title, items, tone, rules, sourceTitle, text }: { title: string; items: EligibilityRuleDetail[]; tone: keyof typeof tones; rules: ProductRule[]; sourceTitle: string; text: (typeof copy)[keyof typeof copy] }) { return <section className={`rounded-card border p-5 ${tones[tone]}`}><div className="flex justify-between gap-3"><h3 className="font-bold text-ink">{title}</h3><span className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-muted">{items.length}</span></div>{items.length ? <div className="mt-4 space-y-3">{items.map((detail, index) => { const rule = rules.find((candidate) => candidate.id === detail.ruleId || candidate.ruleKey === detail.key); return <article className="rounded-control border border-line bg-surface p-4" key={`${detail.key}-${index}`}><p className="text-sm font-semibold leading-6 text-ink">{detail.message}</p>{detail.sourceExcerpt ? <blockquote className="mt-2 border-l-2 border-line-strong pl-3 text-xs leading-5 text-muted">{detail.sourceExcerpt}</blockquote> : null}{detail.sourceUrl ? <div className="mt-3 text-xs leading-5 text-muted"><a className="ui-link" href={detail.sourceUrl} rel="noreferrer" target="_blank">{text.source}: {sourceTitle} ↗</a>{rule?.verifiedAt ? <span> · {text.checked}: {rule.verifiedAt.slice(0, 10)}</span> : null}{detail.sourceLocator ? <p className="mt-1">{text.locator}: {detail.sourceLocator}</p> : null}</div> : null}</article>; })}</div> : <p className="mt-4 text-sm text-muted">{text.empty}</p>}</section>; }
function RuleEvidence({ rules, sourceTitle, text }: { rules: ProductRule[]; sourceTitle: string; text: (typeof copy)[keyof typeof copy] }) { const locale = text === copy.ko ? "ko" : text === copy.vi ? "vi" : "en"; return <section className="ui-card p-6 sm:p-8"><p className="ui-eyebrow">{text.source}</p><h2 className="mt-2 text-2xl font-bold text-ink">{text.ruleTitle}</h2>{rules.length ? <div className="mt-5 grid gap-3">{rules.map((rule) => <details className="rounded-card border border-line bg-surface" key={rule.id}><summary className="flex min-h-14 cursor-pointer list-none flex-wrap items-center gap-2 px-5 py-4"><span className="rounded-full border border-status-info-border bg-status-info-bg px-2.5 py-1 text-xs font-semibold text-status-info">{ruleLevelLabels[locale][rule.ruleLevel]}</span><span className="rounded-full border border-line bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-muted">{rule.mandatory ? text.required : text.optional}</span><span className="min-w-0 flex-1"><strong className="block text-sm text-ink">{rule.description}</strong><span className="mt-1 block text-xs text-muted">{sourceTitle}</span></span><span className="text-muted" aria-hidden>＋</span></summary><div className="border-t border-line px-5 py-4"><blockquote className="border-l-2 border-line-strong pl-3 text-sm leading-6 text-muted">{rule.sourceExcerpt}</blockquote><dl className="mt-4 grid gap-2 text-xs leading-5 text-muted sm:grid-cols-2"><div><dt className="font-semibold text-ink">{text.checked}</dt><dd>{rule.verifiedAt.slice(0, 10)}</dd></div><div><dt className="font-semibold text-ink">{text.locator}</dt><dd>{rule.sourceLocator}</dd></div></dl></div></details>)}</div> : <p className="mt-4 text-muted">{text.noRules}</p>}</section>; }
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

function dynamicFieldLabel(field: DynamicFieldKey, locale: Locale) {
  return dynamicFieldLabels[locale][field];
}
