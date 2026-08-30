"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import type { Locale } from "@/i18n/config";
import { institutionLabel, productNameLabel } from "@/lib/product-localization";
import { productDetailLabel } from "@/lib/product-detail-localization";
import { officialText } from "@/lib/official-text-localization";
import { getProduct } from "@/services/product";
import { getPersonalizedGuidance } from "@/services/guidance";
import { precheckEligibility } from "@/services/eligibility";
import { getAiExplanation } from "@/services/ai-explanation";
import { conditionAsks, openingRequest, tellerExchangesFor } from "@/lib/teller-questions";
import type { ProductDocumentRequirement } from "@/types/guidance";

const copy = {
  ko: { iAsk: "내가 확인을 요청할 것", theyAsk: "은행원이 물어볼 수 있는 것", theyAskHint: "굵은 한국어가 은행원이 말하는 문장입니다. 아래에서 내 상황에 맞는 답을 골라 보여주세요.", myAnswer: "내 답변", eyebrow: "창구 준비 패킷", back: "상품 상세로", print: "인쇄 · PDF 저장", generated: "작성일", noProfile: "먼저 임시 금융 프로필을 입력해 주세요.", profile: "프로필 입력", loading: "준비 패킷을 만들고 있습니다...", error: "준비 패킷을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.", documents: "1. 챙겨갈 서류", official: "공식 필수", conditional: "상황에 따라 필요", bank: "은행 확인 필요", noDocuments: "등록된 공식 서류가 없습니다. 아래 공식 근거에서 확인해 주세요.", script: "2. 창구에서 보여줄 문장", scriptHint: "아래 한국어 문장을 은행원에게 보여주세요. 아래쪽은 같은 내용의 번역입니다.", show: "은행원에게 보여주기", close: "닫기", confirm: "3. 은행원과 주고받을 대화", noConfirm: "추가로 확인할 항목이 없습니다.", steps: "4. 공식 신청 절차", step: "STEP", channel: "신청 채널", noSteps: "등록된 공식 절차가 없습니다.", evidence: "5. 공식 근거", checked: "확인일", openSource: "공식 정보 열기", apply: "신청 페이지 열기", notice: "이 문서는 방문 전 준비를 돕기 위한 안내이며 가입 승인이나 자격을 보장하지 않습니다. 최종 판단은 금융기관이 합니다." },
  en: { iAsk: "What I ask", theyAsk: "What the teller may ask you", theyAskHint: "The bold Korean is what the teller says. Pick the answer that fits your situation and show it.", myAnswer: "My answer", eyebrow: "Bank visit packet", back: "Back to product", print: "Print / Save as PDF", generated: "Prepared on", noProfile: "Create a temporary financial profile first.", profile: "Create profile", loading: "Preparing your packet...", error: "The packet could not be created. Please try again shortly.", documents: "1. Documents to bring", official: "Officially required", conditional: "Required in some cases", bank: "Bank confirmation needed", noDocuments: "No official documents are registered. Check the official evidence below.", script: "2. What to show at the counter", scriptHint: "Show the Korean text below to the bank teller. The same message follows in your language.", show: "Show to the teller", close: "Close", confirm: "3. Talking with the teller", noConfirm: "There is nothing further to confirm.", steps: "4. Official application steps", step: "STEP", channel: "Channel", noSteps: "No official steps are registered.", evidence: "5. Official evidence", checked: "Checked", openSource: "Open official information", apply: "Open application page", notice: "This document helps you prepare before your visit. It does not guarantee approval or eligibility. The financial institution makes the final decision." },
  vi: { iAsk: "Điều tôi hỏi", theyAsk: "Điều nhân viên có thể hỏi bạn", theyAskHint: "Dòng tiếng Hàn in đậm là câu nhân viên nói. Hãy chọn câu trả lời phù hợp và đưa cho họ xem.", myAnswer: "Câu trả lời của tôi", eyebrow: "Bộ hồ sơ đến quầy", back: "Về chi tiết sản phẩm", print: "In / Lưu PDF", generated: "Ngày lập", noProfile: "Hãy tạo hồ sơ tài chính tạm thời trước.", profile: "Nhập hồ sơ", loading: "Đang tạo bộ hồ sơ...", error: "Không thể tạo bộ hồ sơ. Vui lòng thử lại sau.", documents: "1. Giấy tờ cần mang theo", official: "Bắt buộc chính thức", conditional: "Cần tùy trường hợp", bank: "Cần ngân hàng xác nhận", noDocuments: "Chưa có giấy tờ chính thức được đăng ký. Hãy xem căn cứ chính thức bên dưới.", script: "2. Câu để đưa cho nhân viên", scriptHint: "Hãy đưa đoạn tiếng Hàn bên dưới cho nhân viên ngân hàng. Phía dưới là bản dịch cùng nội dung.", show: "Đưa cho nhân viên xem", close: "Đóng", confirm: "3. Trao đổi với nhân viên ngân hàng", noConfirm: "Không có nội dung nào cần xác nhận thêm.", steps: "4. Quy trình đăng ký chính thức", step: "BƯỚC", channel: "Kênh", noSteps: "Chưa có quy trình chính thức được đăng ký.", evidence: "5. Căn cứ chính thức", checked: "Ngày xác nhận", openSource: "Mở thông tin chính thức", apply: "Mở trang đăng ký", notice: "Tài liệu này giúp bạn chuẩn bị trước khi đến. Nó không bảo đảm việc phê duyệt hay điều kiện. Tổ chức tài chính đưa ra quyết định cuối cùng." },
  zh: { iAsk: "我要确认的事项", theyAsk: "银行职员可能会问的问题", theyAskHint: "粗体韩语是银行职员说的话。请选择符合您情况的回答并出示。", myAnswer: "我的回答", eyebrow: "柜台准备包", back: "返回产品详情", print: "打印 / 保存 PDF", generated: "制作日期", noProfile: "请先填写临时金融资料。", profile: "填写资料", loading: "正在生成准备包…", error: "未能生成准备包，请稍后再试。", documents: "1. 需要携带的材料", official: "官方必备", conditional: "视情况需要", bank: "需银行确认", noDocuments: "尚未登记官方材料，请查看下方官方依据。", script: "2. 在柜台出示的句子", scriptHint: "请把下面的韩语出示给银行职员。下方是相同内容的译文。", show: "出示给银行职员", close: "关闭", confirm: "3. 与银行职员的对话", noConfirm: "没有需要额外确认的事项。", steps: "4. 官方申请流程", step: "步骤", channel: "渠道", noSteps: "尚未登记官方流程。", evidence: "5. 官方依据", checked: "确认日期", openSource: "打开官方信息", apply: "打开申请页面", notice: "本文件用于帮助您在办理前做好准备，不保证开户或资格。最终判断由金融机构作出。" },
  ja: { iAsk: "私が確認を依頼すること", theyAsk: "銀行員から聞かれる可能性のあること", theyAskHint: "太字の韓国語が銀行員の発言です。ご自身の状況に合う答えを選んで見せてください。", myAnswer: "私の答え", eyebrow: "窓口準備パケット", back: "商品詳細へ戻る", print: "印刷 / PDF 保存", generated: "作成日", noProfile: "先に一時的な金融プロフィールを入力してください。", profile: "プロフィール入力", loading: "準備パケットを作成しています…", error: "準備パケットを作成できませんでした。しばらくしてからもう一度お試しください。", documents: "1. 持参する書類", official: "公式の必須書類", conditional: "状況に応じて必要", bank: "銀行の確認が必要", noDocuments: "登録された公式書類はありません。下記の公式根拠をご確認ください。", script: "2. 窓口で見せる文章", scriptHint: "下の韓国語を銀行員に見せてください。その下は同じ内容の翻訳です。", show: "銀行員に見せる", close: "閉じる", confirm: "3. 銀行員とのやり取り", noConfirm: "追加で確認する項目はありません。", steps: "4. 公式の申請手続き", step: "STEP", channel: "チャネル", noSteps: "登録された公式手続きはありません。", evidence: "5. 公式根拠", checked: "確認日", openSource: "公式情報を開く", apply: "申込ページを開く", notice: "この書類は訪問前の準備を助けるための案内であり、加入の承認や資格を保証するものではありません。最終判断は金融機関が行います。" },
  th: { iAsk: "สิ่งที่ฉันจะถาม", theyAsk: "สิ่งที่พนักงานธนาคารอาจถามคุณ", theyAskHint: "ข้อความภาษาเกาหลีตัวหนาคือสิ่งที่พนักงานพูด เลือกคำตอบที่ตรงกับสถานการณ์ของคุณแล้วแสดงให้ดู", myAnswer: "คำตอบของฉัน", eyebrow: "ชุดเตรียมตัวไปเคาน์เตอร์", back: "กลับไปหน้ารายละเอียด", print: "พิมพ์ / บันทึก PDF", generated: "วันที่จัดทำ", noProfile: "กรุณากรอกโปรไฟล์การเงินชั่วคราวก่อน", profile: "กรอกโปรไฟล์", loading: "กำลังจัดทำชุดเตรียมตัว...", error: "ไม่สามารถจัดทำชุดเตรียมตัวได้ กรุณาลองใหม่อีกครั้ง", documents: "1. เอกสารที่ต้องนำไป", official: "จำเป็นอย่างเป็นทางการ", conditional: "จำเป็นตามแต่ละกรณี", bank: "ต้องให้ธนาคารยืนยัน", noDocuments: "ยังไม่มีเอกสารอย่างเป็นทางการที่ลงทะเบียน กรุณาตรวจสอบหลักฐานด้านล่าง", script: "2. ข้อความที่จะแสดงที่เคาน์เตอร์", scriptHint: "กรุณาแสดงข้อความภาษาเกาหลีด้านล่างแก่พนักงานธนาคาร ด้านล่างเป็นคำแปลของข้อความเดียวกัน", show: "แสดงให้พนักงานธนาคาร", close: "ปิด", confirm: "3. การสนทนากับพนักงานธนาคาร", noConfirm: "ไม่มีรายการที่ต้องยืนยันเพิ่มเติม", steps: "4. ขั้นตอนการสมัครอย่างเป็นทางการ", step: "ขั้นที่", channel: "ช่องทาง", noSteps: "ยังไม่มีขั้นตอนอย่างเป็นทางการที่ลงทะเบียน", evidence: "5. หลักฐานอย่างเป็นทางการ", checked: "วันที่ตรวจสอบ", openSource: "เปิดข้อมูลอย่างเป็นทางการ", apply: "เปิดหน้าสมัคร", notice: "เอกสารนี้ช่วยให้คุณเตรียมตัวก่อนไปติดต่อ ไม่ได้รับประกันการอนุมัติหรือคุณสมบัติ สถาบันการเงินเป็นผู้ตัดสินใจขั้นสุดท้าย" },
} as const;

export function BankVisitPacket() {
  const { locale } = useLocale();
  const text = copy[locale];
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [sessionId, setSessionId] = useState<string | null | undefined>(undefined);
  const [showing, setShowing] = useState(false);
  useEffect(() => setSessionId(localStorage.getItem("visafyProfileSessionId")), []);

  const enabled = Boolean(sessionId) && Number.isFinite(id);
  const product = useQuery({ queryKey: ["product", id], queryFn: () => getProduct(id), enabled: Number.isFinite(id) });
  const guidance = useQuery({ queryKey: ["packet-guidance", id, sessionId], queryFn: () => getPersonalizedGuidance(id, sessionId!), enabled });
  const precheck = useQuery({ queryKey: ["packet-precheck", id, sessionId], queryFn: () => precheckEligibility({ productId: id, profileSessionId: sessionId! }), enabled });
  const explanation = useQuery({ queryKey: ["packet-explanation", id, sessionId], queryFn: () => getAiExplanation({ productId: id, profileSessionId: sessionId! }), enabled });

  if (sessionId === null) return <Shell><div className="ui-alert-warning flex flex-wrap items-center justify-between gap-3"><p>{text.noProfile}</p><Link className="ui-link" href="/profile">{text.profile} →</Link></div></Shell>;
  if (product.isError || guidance.isError || precheck.isError || explanation.isError) return <Shell><p className="ui-alert-danger" role="alert">{text.error}</p></Shell>;
  if (!product.data || !guidance.data || !precheck.data || !explanation.data) return <Shell><p className="text-sm text-muted" aria-live="polite">{text.loading}</p></Shell>;

  const name = productNameLabel(locale, product.data.productCode, product.data.productName);
  // Nothing left for the bank to confirm still needs an opening line, and section 2 must not
  // vanish and leave the packet numbered 1, 3, 4, 5.
  const inquiry = explanation.data.inquiry
    ?? { korean: openingRequest(product.data.productName).ko, localized: openingRequest(product.data.productName)[locale] };
  const confirmations = [...precheck.data.externalChecks, ...precheck.data.unknownRules];
  const exchanges = tellerExchangesFor(product.data.rules.map((rule) => rule.ruleKey));
  const groups: Array<{ title: string; tone: string; items: ProductDocumentRequirement[] }> = [
    { title: text.official, tone: "border-status-success-border bg-status-success-bg", items: guidance.data.officialRequired },
    { title: text.conditional, tone: "border-status-warning-border bg-status-warning-bg", items: guidance.data.conditional },
    { title: text.bank, tone: "border-status-neutral-border bg-status-neutral-bg", items: guidance.data.bankConfirmation },
  ];
  const documentTotal = groups.reduce((total, group) => total + group.items.length, 0);

  return <Shell>
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
      <div>
        <p className="ui-eyebrow">{text.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-ink">{product.data.productName}</h1>
        {name.name === product.data.productName ? null : <p className="mt-1 text-lg font-semibold text-muted">{name.name}</p>}
        <p className="mt-3 text-sm text-muted">{institutionLabel(locale, product.data.institution)} · {text.generated} {new Date().toLocaleDateString()}</p>
      </div>
      <div className="flex flex-wrap gap-2 print:hidden">
        <Link className="ui-button ui-button-secondary" href={`/products/${id}`}>← {text.back}</Link>
        <button className="ui-button ui-button-secondary" onClick={() => window.print()} type="button">{text.print}</button>
      </div>
    </header>

    <Section title={text.documents}>
      {documentTotal === 0 ? <p className="ui-alert-warning">{text.noDocuments}</p> : <div className="grid gap-4 sm:grid-cols-3">
        {groups.map((group) => <section className={`rounded-card border p-4 ${group.tone}`} key={group.title}>
          <h3 className="font-bold text-ink">{group.title}</h3>
          {group.items.length === 0 ? <p className="mt-3 text-sm text-muted">—</p> : <ul className="mt-3 space-y-2">{group.items.map((item) => <li className="flex items-start gap-2 text-sm" key={item.id}><span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded-sm border border-ink" aria-hidden /><span><Bilingual korean={item.documentName} locale={locale} />{item.description ? <span className="block text-xs leading-5 text-muted">{officialText(locale, item.description)}</span> : null}</span></li>)}</ul>}
        </section>)}
      </div>}
    </Section>

    <Section title={text.script}>
      <p className="text-sm text-muted print:hidden">{text.scriptHint}</p>
      <div className="mt-3 rounded-panel border-2 border-brand bg-surface p-5">
        <p className="text-xl font-bold leading-9 text-ink sm:text-2xl">{inquiry.korean}</p>
        {locale === "ko" ? null : <p className="mt-4 border-t border-line pt-4 text-sm leading-7 text-muted">{inquiry.localized}</p>}
      </div>
      <button className="ui-button ui-button-primary mt-3 print:hidden" onClick={() => setShowing(true)} type="button">{text.show}</button>
    </Section>

    <Section title={text.confirm}>
      <h3 className="text-sm font-bold text-ink">{text.iAsk}</h3>
      {confirmations.length === 0 ? <p className="mt-2 text-sm text-muted">{text.noConfirm}</p> : <ul className="mt-2 space-y-2">{confirmations.map((rule) => <li className="rounded-card border border-line bg-surface-subtle p-3" key={`${rule.key}-${rule.messageCode}`}>
        {conditionAsks[rule.key] ? <><p className="text-base font-semibold leading-7 text-ink">{conditionAsks[rule.key].ko}</p>{locale === "ko" ? null : <p className="mt-1 text-xs leading-5 text-muted">{conditionAsks[rule.key][locale]}</p>}</> : <p className="text-sm text-ink">{rule.message}</p>}
      </li>)}</ul>}

      <h3 className="mt-6 text-sm font-bold text-ink">{text.theyAsk}</h3>
      <p className="mt-1 text-xs text-muted">{text.theyAskHint}</p>
      <ul className="mt-2 space-y-3">{exchanges.map((exchange) => <li className="rounded-card border border-line p-4" key={exchange.id}>
        <p className="text-base font-semibold leading-7 text-ink">{exchange.question.ko}</p>
        {locale === "ko" ? null : <p className="mt-1 text-xs leading-5 text-muted">{exchange.question[locale]}</p>}
        <p className="mt-3 text-xs font-semibold text-brand">{text.myAnswer}</p>
        <ul className="mt-1 space-y-1.5">{exchange.answers.map((answer) => <li className="rounded-control border border-line bg-surface-subtle px-3 py-2" key={answer.ko}><p className="text-sm font-medium text-ink">{answer.ko}</p>{locale === "ko" ? null : <p className="text-xs leading-5 text-muted">{answer[locale]}</p>}</li>)}</ul>
      </li>)}</ul>
    </Section>

    <Section title={text.steps}>
      {guidance.data.applicationSteps.length === 0 ? <p className="text-sm text-muted">{text.noSteps}</p> : <ol className="grid gap-3">{guidance.data.applicationSteps.map((step) => <li className="grid gap-2 rounded-card border border-line p-4 sm:grid-cols-[72px_1fr]" key={step.id}><div className="text-sm font-bold text-brand">{text.step} {step.stepOrder}</div><div><h4 className="font-bold text-ink">{officialText(locale, step.title)}</h4><p className="mt-1 text-sm leading-6 text-muted">{officialText(locale, step.description)}</p>{step.channel ? <p className="mt-1 text-xs text-muted">{text.channel}: {officialText(locale, step.channel)}</p> : null}</div></li>)}</ol>}
    </Section>

    <Section title={text.evidence}>
      <p className="text-sm font-semibold text-ink">{productDetailLabel(locale, product.data.productCode, "sourceTitle", product.data.sourceTitle)}</p>
      <p className="mt-1 break-all text-xs text-muted">{product.data.sourceUrl}</p>
      <div className="mt-3 flex flex-wrap gap-2 print:hidden">
        <a className="ui-button ui-button-secondary" href={product.data.sourceUrl} rel="noreferrer" target="_blank">{text.openSource} ↗</a>
        {product.data.officialApplicationUrl ? <a className="ui-button ui-button-primary" href={product.data.officialApplicationUrl} rel="noreferrer" target="_blank">{text.apply} ↗</a> : null}
      </div>
    </Section>

    <p className="mt-8 rounded-card border border-line bg-surface-subtle p-4 text-xs leading-5 text-muted">{text.notice}</p>

    {showing ? <div className="fixed inset-0 z-50 flex flex-col bg-surface p-6 print:hidden" role="dialog" aria-modal="true">
      <button className="ui-button ui-button-secondary self-end" onClick={() => setShowing(false)} type="button">{text.close}</button>
      <div className="flex flex-1 items-center overflow-y-auto py-6"><p className="text-2xl font-bold leading-10 text-ink sm:text-4xl sm:leading-[3.5rem]">{inquiry.korean}</p></div>
    </div> : null}
  </Shell>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-3xl px-5 py-10 sm:px-6">{children}</main>;
}

/**
 * A document has to be asked for and handed over by its Korean name, so the packet keeps the
 * Korean beside the translation instead of replacing it.
 */
function Bilingual({ korean, locale }: { korean: string; locale: Locale }) {
  const translated = officialText(locale, korean);
  return <strong className="font-semibold text-ink">{translated}{translated === korean ? null : <span className="ml-1 text-xs font-medium text-quiet">({korean})</span>}</strong>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-8 break-inside-avoid"><h2 className="text-xl font-bold text-ink">{title}</h2><div className="mt-3">{children}</div></section>;
}
