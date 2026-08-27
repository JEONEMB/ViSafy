"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { nationalityName } from "@/lib/nationalities";
import { getFinancialJourney, updateJourneyProgress } from "@/services/financial-journey";
import type { FinancialProduct, ProductCategory } from "@/types/product";

const statusClass = {
  COMPLETED: "border-status-success-border bg-status-success-bg text-status-success",
  CURRENT: "border-brand bg-brand-soft text-brand",
  UPCOMING: "border-line bg-surface-subtle text-muted",
  NEED_CONFIRMATION: "border-status-warning-border bg-status-warning-bg text-status-warning",
} as const;

const copy = {
  ko: { eyebrow: "금융생활 안내", next: "현재 다음 행동", choose: "단계를 선택해 필요한 준비와 관련 상품을 확인하세요.", profile: "내 준비상태", country: "입력한 국적", ready: "준비됨", check: "확인 필요", products: "이 단계의 관련 금융상품", documents: "공식 준비서류", channel: "공식 신청방법", unknown: "등록된 공식 자료에서 확인이 필요합니다.", noProducts: "현재 이 단계에 연결된 공식 상품이 없습니다.", detail: "준비사항 자세히", official: "금융기관 공식 정보", notice: "아래 내용은 가입 승인이 아니라 방문·신청 전에 확인할 준비사항입니다." },
  en: { eyebrow: "Financial life guide", next: "Your next action", choose: "Select a step to review preparation and related products.", profile: "My preparation", country: "Nationality entered", ready: "Ready", check: "Check needed", products: "Related financial products", documents: "Official document guidance", channel: "Official application method", unknown: "This needs confirmation in the registered official information.", noProducts: "No official product is currently connected to this step.", detail: "Review preparation", official: "Official institution information", notice: "This is preparation guidance before a visit or application, not an approval decision." },
  vi: { eyebrow: "Hướng dẫn đời sống tài chính", next: "Hành động tiếp theo", choose: "Chọn một bước để xem nội dung chuẩn bị và sản phẩm liên quan.", profile: "Tình trạng chuẩn bị", country: "Quốc tịch đã nhập", ready: "Đã chuẩn bị", check: "Cần xác nhận", products: "Sản phẩm tài chính liên quan", documents: "Hướng dẫn giấy tờ chính thức", channel: "Cách đăng ký chính thức", unknown: "Cần xác nhận trong thông tin chính thức đã đăng ký.", noProducts: "Hiện chưa có sản phẩm chính thức liên kết với bước này.", detail: "Xem chuẩn bị", official: "Thông tin chính thức", notice: "Đây là hướng dẫn chuẩn bị trước khi đến hoặc đăng ký, không phải quyết định phê duyệt." },
  zh: { eyebrow: "金融生活指南", next: "下一步行动", choose: "选择一个阶段，查看准备事项和相关产品。", profile: "我的准备情况", country: "已输入国籍", ready: "已准备", check: "需要确认", products: "相关金融产品", documents: "官方材料指南", channel: "官方申请方式", unknown: "需要在已登记的官方信息中确认。", noProducts: "目前此阶段没有关联的官方产品。", detail: "查看准备事项", official: "金融机构官方信息", notice: "以下是访问或申请前的准备指南，并非批准结果。" },
  ja: { eyebrow: "金融生活ガイド", next: "次の行動", choose: "段階を選択して、準備事項と関連商品を確認してください。", profile: "準備状況", country: "入力した国籍", ready: "準備済み", check: "確認が必要", products: "関連する金融商品", documents: "公式の必要書類案内", channel: "公式の申込方法", unknown: "登録済みの公式情報で確認が必要です。", noProducts: "現在、この段階に関連する公式商品はありません。", detail: "準備事項を確認", official: "金融機関の公式情報", notice: "以下は訪問・申込前の準備案内であり、承認結果ではありません。" },
  th: { eyebrow: "คู่มือชีวิตทางการเงิน", next: "ขั้นตอนถัดไป", choose: "เลือกขั้นตอนเพื่อดูสิ่งที่ต้องเตรียมและผลิตภัณฑ์ที่เกี่ยวข้อง", profile: "สถานะการเตรียมตัว", country: "สัญชาติที่กรอก", ready: "พร้อม", check: "ต้องตรวจสอบ", products: "ผลิตภัณฑ์ทางการเงินที่เกี่ยวข้อง", documents: "คำแนะนำเอกสารอย่างเป็นทางการ", channel: "วิธีสมัครอย่างเป็นทางการ", unknown: "ต้องตรวจสอบจากข้อมูลทางการที่ลงทะเบียนไว้", noProducts: "ขณะนี้ยังไม่มีผลิตภัณฑ์ทางการที่เชื่อมกับขั้นตอนนี้", detail: "ดูสิ่งที่ต้องเตรียม", official: "ข้อมูลทางการของสถาบันการเงิน", notice: "ข้อมูลนี้เป็นแนวทางเตรียมตัวก่อนเข้ารับบริการหรือสมัคร ไม่ใช่ผลการอนุมัติ" },
} as const;

export type JourneyTarget = { code: string; productId?: number };
export type JourneyFocus = JourneyTarget | null;

export function FinancialJourneyPanel({ products = [], focus = null }: { products?: FinancialProduct[]; focus?: JourneyFocus }) {
  const { locale } = useLocale();
  const text = copy[locale];
  const [sessionId, setSessionId] = useState<string | null>();
  const [selectedCode, setSelectedCode] = useState<string | null>(focus?.code ?? null);
  const queryClient = useQueryClient();
  useEffect(() => setSessionId(localStorage.getItem("visafyProfileSessionId")), []);
  useEffect(() => {
    if (!focus?.code) return;
    setSelectedCode(focus.code);
    window.requestAnimationFrame(() => document.getElementById("financial-journey")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, [focus]);
  const journey = useQuery({ queryKey: ["financial-journey", sessionId], queryFn: () => getFinancialJourney(sessionId!), enabled: Boolean(sessionId) });
  const progress = useMutation({ mutationFn: ({ code, completed }: { code: string; completed: boolean }) => updateJourneyProgress(sessionId!, code, completed), onSuccess: (data) => queryClient.setQueryData(["financial-journey", sessionId], data) });
  const selectedStep = journey.data?.steps.find((step) => step.code === selectedCode)
    ?? journey.data?.steps.find((step) => step.status === "CURRENT")
    ?? journey.data?.steps[0];
  const relatedProducts = useMemo(() => selectedStep ? productsForStep(selectedStep.code, products, focus?.productId) : [], [selectedStep, products, focus?.productId]);
  if (!sessionId || !journey.data) return null;
  const preparations = preparationForStep(selectedStep?.code ?? "IDENTITY_PREPARATION", journey.data.profile, locale);
  return <section className="ui-panel mt-8 scroll-mt-24 p-6 sm:p-8" id="financial-journey" aria-labelledby="financial-journey-heading">
    <p className="ui-eyebrow">{text.eyebrow}</p>
    <h2 className="mt-2 text-2xl font-bold text-ink" id="financial-journey-heading">{journey.data.headline}</h2>
    <div className="ui-alert-info mt-4"><strong>{text.next}:</strong> {journey.data.nextAction}</div>
    <p className="mt-4 text-sm text-muted">{text.choose}</p>
    <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {journey.data.steps.map((step) => <li key={step.code}><button aria-pressed={selectedStep?.code === step.code} className={`h-full w-full rounded-card border p-4 text-left transition hover:-translate-y-0.5 hover:border-brand ${selectedStep?.code === step.code ? "ring-2 ring-brand/20" : ""} ${statusClass[step.status]}`} onClick={() => setSelectedCode(step.code)} type="button"><div className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">{step.step}</span><h3 className="font-bold">{step.title}</h3></div><p className="mt-2 text-xs leading-5 opacity-80">{step.description}</p></button></li>)}
    </ol>

    {selectedStep ? <section className="mt-7 rounded-panel border border-line bg-surface-subtle p-5 sm:p-6" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold text-brand">STEP {selectedStep.step}</p><h3 className="mt-1 text-xl font-bold text-ink">{selectedStep.title}</h3></div><div className="flex flex-wrap gap-2"><span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-muted">{text.country}: {nationalityName(journey.data.profile.nationality, locale)}</span><button className="ui-button ui-button-secondary min-h-8 px-3 py-1 text-xs" disabled={progress.isPending} onClick={() => progress.mutate({ code: selectedStep.code, completed: selectedStep.status !== "COMPLETED" })} type="button">{selectedStep.status === "COMPLETED" ? "↩ Undo" : "✓ Complete"}</button></div></div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <article className="rounded-card border border-line bg-surface p-4"><h4 className="font-bold text-ink">{text.profile}</h4><ul className="mt-3 space-y-2 text-sm">{preparations.map((item) => <li className="flex items-start justify-between gap-3" key={item.label}><span className="text-muted">{item.label}</span><strong className={item.ready ? "text-status-success" : "text-status-warning"}>{item.ready ? `✓ ${text.ready}` : `△ ${text.check}`}</strong></li>)}</ul></article>
          <p className="ui-alert-warning text-sm">{text.notice}</p>
        </div>
        <div><h4 className="font-bold text-ink">{text.products}</h4>{relatedProducts.length ? <div className="mt-3 grid gap-3">{relatedProducts.map((product) => <article className="rounded-card border border-line bg-surface p-4" key={product.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold text-brand">{product.institution}</p><h5 className="mt-1 font-bold text-ink">{product.productName}</h5></div><span className="rounded-full border border-line bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-muted">{journeyAudienceLabel(locale, product.productAudience)}</span></div><p className="mt-3 text-sm leading-6 text-muted">{product.targetSummary}</p><dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2"><div className="rounded-control border border-line bg-surface-subtle p-3"><dt className="font-bold text-ink">{text.documents}</dt><dd className="mt-1 leading-5 text-muted">{product.dataPackage.documentEvidence ? product.requiredDocuments : text.unknown}</dd></div><div className="rounded-control border border-line bg-surface-subtle p-3"><dt className="font-bold text-ink">{text.channel}</dt><dd className="mt-1 leading-5 text-muted">{product.dataPackage.channelEvidence ? product.applicationMethod : text.unknown}</dd></div></dl><div className="mt-4 flex flex-wrap gap-2"><Link className="ui-button ui-button-secondary min-h-9 px-3 py-1.5 text-xs" href={`/products/${product.id}?tab=documents`}>{text.detail}</Link><a className="ui-button ui-button-primary min-h-9 px-3 py-1.5 text-xs" href={product.sourceUrl} rel="noreferrer" target="_blank">{text.official} ↗</a></div></article>)}</div> : <p className="mt-3 rounded-card border border-dashed border-line-strong p-5 text-sm text-muted">{text.noProducts}</p>}</div>
      </div>
    </section> : null}
  </section>;
}

function productsForStep(code: string, products: FinancialProduct[], focusedProductId?: number) {
  const categoryMap: Record<string, ProductCategory[]> = {
    IDENTITY_PREPARATION: ["DEMAND_DEPOSIT"],
    DEMAND_DEPOSIT_ACCOUNT: ["DEMAND_DEPOSIT"],
    RECEIVE_SALARY: ["DEMAND_DEPOSIT"],
    DEBIT_CARD: ["DEBIT_CARD"],
    SAVINGS: ["SAVINGS", "TIME_DEPOSIT"],
    REMITTANCE: ["REMITTANCE"],
    BUILD_CREDIT: ["CREDIT_CARD"],
    LOAN_AND_HOUSING: ["PERSONAL_LOAN", "HOUSING_LOAN", "POLICY_FINANCE"],
    INVESTMENT: ["SECURITIES"],
  };
  return products.filter((product) => categoryMap[code]?.includes(product.productCategory))
    .sort((left, right) => Number(right.id === focusedProductId) - Number(left.id === focusedProductId));
}

function preparationForStep(code: string, profile: { hasResidenceCard: boolean; hasPassport: boolean; hasDomesticPhone: boolean; canDomesticPhoneVerify: boolean; hasKoreanBankAccount: boolean; hasKoreanCreditHistory: boolean; remittanceCountry?: string | null }, locale: keyof typeof copy) {
  const labels = {
    ko: { identity: "금융기관에서 사용할 신분증", passport: "여권", phone: "국내 휴대전화", verification: "휴대전화 본인인증", account: "국내 입출금계좌", credit: "국내 신용이력", destination: "송금 대상 국가" },
    en: { identity: "Accepted identity document", passport: "Passport", phone: "Korean mobile phone", verification: "Mobile identity verification", account: "Korean demand-deposit account", credit: "Korean credit history", destination: "Remittance destination" },
    vi: { identity: "Giấy tờ tùy thân được chấp nhận", passport: "Hộ chiếu", phone: "Điện thoại Hàn Quốc", verification: "Xác minh qua điện thoại", account: "Tài khoản thanh toán Hàn Quốc", credit: "Lịch sử tín dụng tại Hàn Quốc", destination: "Quốc gia nhận tiền" },
    zh: { identity: "金融机构接受的身份证件", passport: "护照", phone: "韩国手机", verification: "手机本人认证", account: "韩国活期账户", credit: "韩国信用记录", destination: "汇款国家" },
    ja: { identity: "金融機関で使用する本人確認書類", passport: "パスポート", phone: "韓国の携帯電話", verification: "携帯電話本人認証", account: "韓国の入出金口座", credit: "韓国の信用履歴", destination: "送金先の国" },
    th: { identity: "เอกสารยืนยันตัวตนที่สถาบันการเงินรับรอง", passport: "หนังสือเดินทาง", phone: "โทรศัพท์มือถือเกาหลี", verification: "การยืนยันตัวตนทางมือถือ", account: "บัญชีเงินฝากเกาหลี", credit: "ประวัติเครดิตในเกาหลี", destination: "ประเทศปลายทางการโอนเงิน" },
  }[locale];
  const identity = profile.hasResidenceCard || profile.hasPassport;
  const common = [{ label: labels.identity, ready: identity }];
  if (code === "IDENTITY_PREPARATION") return [...common, { label: labels.passport, ready: profile.hasPassport }, { label: labels.phone, ready: profile.hasDomesticPhone }];
  if (["DEMAND_DEPOSIT_ACCOUNT", "RECEIVE_SALARY", "DEBIT_CARD"].includes(code)) return [...common, { label: labels.phone, ready: profile.hasDomesticPhone }, { label: labels.verification, ready: profile.canDomesticPhoneVerify }];
  if (["SAVINGS", "REMITTANCE", "BUILD_CREDIT", "LOAN_AND_HOUSING", "INVESTMENT"].includes(code)) common.push({ label: labels.account, ready: profile.hasKoreanBankAccount });
  if (["BUILD_CREDIT", "LOAN_AND_HOUSING"].includes(code)) common.push({ label: labels.credit, ready: profile.hasKoreanCreditHistory });
  if (code === "REMITTANCE") common.push({ label: labels.destination, ready: Boolean(profile.remittanceCountry) });
  return common;
}

function journeyAudienceLabel(locale: keyof typeof copy, audience: FinancialProduct["productAudience"]) {
  const labels = {
    ko: { GENERAL: "일반상품", FOREIGNER_SPECIALIZED: "외국인 특화", POLICY: "정책금융" },
    en: { GENERAL: "General", FOREIGNER_SPECIALIZED: "Foreigner-specialized", POLICY: "Policy finance" },
    vi: { GENERAL: "Sản phẩm chung", FOREIGNER_SPECIALIZED: "Dành cho người nước ngoài", POLICY: "Tài chính chính sách" },
    zh: { GENERAL: "一般产品", FOREIGNER_SPECIALIZED: "外国人专属", POLICY: "政策金融" },
    ja: { GENERAL: "一般商品", FOREIGNER_SPECIALIZED: "外国人向け", POLICY: "政策金融" },
    th: { GENERAL: "ผลิตภัณฑ์ทั่วไป", FOREIGNER_SPECIALIZED: "สำหรับชาวต่างชาติ", POLICY: "การเงินเชิงนโยบาย" },
  } as const;
  return labels[locale][audience];
}
