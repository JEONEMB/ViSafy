"use client";

import { useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import type { AiExplanation } from "@/types/ai-explanation";

const copy = {
  ko: { eyebrow: "공식 근거 기반 안내", title: "쉬운 설명과 은행 문의문", description: "확인된 숫자와 비자코드를 바꾸지 않고 쉬운 말로 설명합니다.", facts: "확인에 사용한 값", next: "다음 행동", visa: "체류자격", visaRemaining: "비자 잔여기간", residency: "국내 체류기간", months: "개월", passed: "충족 조건", failed: "미충족 조건", external: "외부 확인", unknown: "비공개 조건", terms: "쉬운 금융용어", inquiry: "은행에 이렇게 문의해 보세요", confirmation: "공식적으로 확인할 항목", korean: "은행 전달용 한국어", translated: "선택 언어 번역", copy: "복사", copied: "복사됨", noInquiry: "현재 결과에는 별도 은행 문의문이 필요하지 않습니다.", error: "쉬운 설명을 일시적으로 불러오지 못했습니다. 위 사전자격 결과는 그대로 유효합니다." },
  en: { eyebrow: "Grounded in official sources", title: "Plain-language explanation and bank inquiry", description: "Explains verified numbers and visa codes in plain language without changing them.", facts: "Values used for this check", next: "Next actions", visa: "Status of Stay", visaRemaining: "Visa remaining", residency: "Residency in Korea", months: "months", passed: "Conditions met", failed: "Conditions not met", external: "External checks", unknown: "Unpublished conditions", terms: "Financial terms in plain language", inquiry: "Ask the bank with this message", confirmation: "Items to confirm officially", korean: "Korean message for the bank", translated: "Translation in your language", copy: "Copy", copied: "Copied", noInquiry: "This result does not currently require a separate bank inquiry.", error: "The plain-language explanation is temporarily unavailable. The pre-check result above remains valid." },
  vi: { eyebrow: "Dựa trên nguồn chính thức", title: "Giải thích dễ hiểu và nội dung hỏi ngân hàng", description: "Giải thích dễ hiểu mà không thay đổi số liệu và mã visa đã xác nhận.", facts: "Giá trị đã dùng để kiểm tra", next: "Hành động tiếp theo", visa: "Tư cách lưu trú", visaRemaining: "Thời hạn visa còn lại", residency: "Thời gian cư trú tại Hàn Quốc", months: "tháng", passed: "Điều kiện đã đạt", failed: "Điều kiện chưa đạt", external: "Kiểm tra bên ngoài", unknown: "Điều kiện không công khai", terms: "Thuật ngữ tài chính dễ hiểu", inquiry: "Hãy hỏi ngân hàng bằng nội dung này", confirmation: "Nội dung cần xác nhận chính thức", korean: "Nội dung tiếng Hàn gửi ngân hàng", translated: "Bản dịch theo ngôn ngữ đã chọn", copy: "Sao chép", copied: "Đã sao chép", noInquiry: "Kết quả hiện tại không cần nội dung hỏi riêng cho ngân hàng.", error: "Tạm thời không thể tải giải thích dễ hiểu. Kết quả kiểm tra sơ bộ ở trên vẫn giữ nguyên." },
  zh: { eyebrow: "基于官方依据的说明", title: "通俗说明与银行咨询文", description: "在不改动已确认的数字与签证代码的前提下，用通俗的语言说明。", facts: "用于本次确认的数值", next: "下一步行动", visa: "停留资格", visaRemaining: "签证剩余期限", residency: "在韩居留期间", months: "个月", passed: "已满足的条件", failed: "未满足的条件", external: "外部确认", unknown: "未公开的条件", terms: "通俗金融术语", inquiry: "可以这样向银行咨询", confirmation: "需要正式确认的事项", korean: "提交给银行的韩语内容", translated: "所选语言的翻译", copy: "复制", copied: "已复制", noInquiry: "当前结果无需另外准备银行咨询文。", error: "暂时无法载入通俗说明。上方的资格预检结果依然有效。" },
  ja: { eyebrow: "公式根拠に基づく案内", title: "やさしい説明と銀行への問い合わせ文", description: "確認済みの数値やビザコードを変えずに、やさしい言葉で説明します。", facts: "確認に使用した値", next: "次の行動", visa: "在留資格", visaRemaining: "ビザ残存期間", residency: "韓国滞在期間", months: "か月", passed: "満たしている条件", failed: "満たしていない条件", external: "外部確認", unknown: "非公開の条件", terms: "やさしい金融用語", inquiry: "銀行にはこのように問い合わせてください", confirmation: "公式に確認する項目", korean: "銀行に渡す韓国語の文面", translated: "選択した言語への翻訳", copy: "コピー", copied: "コピーしました", noInquiry: "現在の結果では、銀行への個別の問い合わせ文は必要ありません。", error: "やさしい説明を一時的に読み込めませんでした。上記の事前資格の結果はそのまま有効です。" },
  th: { eyebrow: "คำอธิบายบนพื้นฐานหลักฐานอย่างเป็นทางการ", title: "คำอธิบายเข้าใจง่ายและข้อความสอบถามธนาคาร", description: "อธิบายด้วยภาษาที่เข้าใจง่ายโดยไม่เปลี่ยนตัวเลขและรหัสวีซ่าที่ยืนยันแล้ว", facts: "ค่าที่ใช้ในการตรวจสอบ", next: "สิ่งที่ควรทำต่อไป", visa: "สถานะการพำนัก", visaRemaining: "ระยะเวลาวีซ่าที่เหลือ", residency: "ระยะเวลาพำนักในเกาหลี", months: "เดือน", passed: "เงื่อนไขที่ผ่าน", failed: "เงื่อนไขที่ไม่ผ่าน", external: "การตรวจสอบภายนอก", unknown: "เงื่อนไขที่ไม่เปิดเผย", terms: "ศัพท์การเงินแบบเข้าใจง่าย", inquiry: "ลองสอบถามธนาคารด้วยข้อความนี้", confirmation: "รายการที่ต้องยืนยันอย่างเป็นทางการ", korean: "ข้อความภาษาเกาหลีสำหรับยื่นต่อธนาคาร", translated: "คำแปลในภาษาที่เลือก", copy: "คัดลอก", copied: "คัดลอกแล้ว", noInquiry: "ผลลัพธ์ปัจจุบันยังไม่จำเป็นต้องมีข้อความสอบถามธนาคารแยกต่างหาก", error: "ไม่สามารถโหลดคำอธิบายแบบเข้าใจง่ายได้ชั่วคราว ผลการตรวจสอบคุณสมบัติด้านบนยังคงใช้ได้" },
} as const;

export function AiExplanationPanel({ data, loading, error }: { data?: AiExplanation; loading: boolean; error: boolean }) {
  const { locale } = useLocale();
  const text = copy[locale];
  const [copied, setCopied] = useState<"ko" | "localized" | null>(null);

  async function copyMessage(value: string, target: "ko" | "localized") {
    await navigator.clipboard.writeText(value);
    setCopied(target);
    window.setTimeout(() => setCopied(null), 1500);
  }

  if (loading) return <section className="ui-card mt-6 animate-pulse p-7"><div className="h-5 w-36 rounded bg-line" /><div className="mt-4 h-20 rounded bg-surface-subtle" /></section>;
  if (error) return <p className="ui-alert-danger mt-6" role="alert">{text.error}</p>;
  if (!data) return null;

  const facts = data.facts;
  const factItems: Array<[string, string | null]> = [
    [text.visa, facts.visaType],
    [text.visaRemaining, facts.visaRemainingMonths === null ? null : `${facts.visaRemainingMonths} ${text.months}`],
    [text.residency, facts.residencyMonths === null ? null : `${facts.residencyMonths} ${text.months}`],
    [text.passed, String(facts.passedCount)],
    [text.failed, String(facts.failedCount)],
    [text.external, String(facts.externalCheckCount)],
    [text.unknown, String(facts.unknownCount)],
  ].filter((item): item is [string, string] => item[1] !== null);

  return <section className="mt-6 overflow-hidden rounded-panel border border-line bg-surface" aria-live="polite">
    <header className="border-b border-line bg-surface-subtle p-6 sm:p-8">
      <p className="text-sm font-semibold text-accent">{text.eyebrow}</p><h2 className="mt-2 text-2xl font-bold text-ink">{text.title}</h2><p className="mt-2 text-sm leading-6 text-muted">{text.description}</p>
      <p className="mt-5 rounded-card border border-line bg-surface p-5 text-sm leading-7 text-ink">{data.explanation}</p>
    </header>
    <div className="space-y-8 p-7 sm:p-8">
      <section><h3 className="font-bold text-ink">{text.facts}</h3><dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{factItems.map(([label, value]) => <div className="rounded-control border border-line bg-surface-subtle p-3" key={label}><dt className="text-xs text-muted">{label}</dt><dd className="mt-1 text-sm font-bold tabular-nums text-ink">{value}</dd></div>)}</dl></section>
      <section><h3 className="font-bold text-ink">{text.next}</h3><ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted">{data.nextActions.map((action) => <li key={action}>{action}</li>)}</ol></section>
      <section><h3 className="font-bold text-ink">{text.terms}</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{data.easyTerms.map((term) => <article className="rounded-card border border-line p-4" key={term.key}><h4 className="font-bold text-ink">{term.koreanTerm}{term.localizedTerm !== term.koreanTerm ? <span className="ml-2 text-sm font-medium text-accent">({term.localizedTerm})</span> : null}</h4><p className="mt-2 text-sm leading-6 text-muted">{term.explanation}</p></article>)}</div></section>
      <section><h3 className="font-bold text-ink">{text.inquiry}</h3>{data.inquiry ? <><div className="mt-3 rounded-card border border-status-warning-border bg-status-warning-bg p-4"><p className="text-sm font-bold text-ink">{text.confirmation}</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">{data.inquiry.confirmationItems.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="mt-4 grid gap-4 lg:grid-cols-2"><MessageCard title={text.korean} value={data.inquiry.korean} action={copied === "ko" ? text.copied : text.copy} onCopy={() => void copyMessage(data.inquiry!.korean, "ko")} />{data.inquiry.language !== "ko" ? <MessageCard title={text.translated} value={data.inquiry.localized} action={copied === "localized" ? text.copied : text.copy} onCopy={() => void copyMessage(data.inquiry!.localized, "localized")} /> : null}</div></> : <p className="ui-alert-success mt-3">{text.noInquiry}</p>}</section>
      <p className="ui-alert-warning font-medium">{data.disclaimer}</p>
    </div>
  </section>;
}

function MessageCard({ title, value, action, onCopy }: { title: string; value: string; action: string; onCopy: () => void }) {
  return <article className="rounded-card border border-line bg-surface-subtle p-5"><div className="flex items-center justify-between gap-3"><h4 className="text-sm font-bold text-ink">{title}</h4><button className="ui-button ui-button-secondary min-h-9 px-3 py-1.5 text-xs" onClick={onCopy} type="button">{action}</button></div><p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted">{value}</p></article>;
}
