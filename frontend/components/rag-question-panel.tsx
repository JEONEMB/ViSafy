"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { institutionLabel } from "@/lib/product-localization";
import { officialText } from "@/lib/official-text-localization";
import { askOfficialDocuments } from "@/services/rag";
import type { ProductRule } from "@/types/product";

const copy = {
  ko: { eyebrow: "공식 정보 AI 도우미", title: "공식 금융문서에 질문하기", description: "이 상품의 검수된 공식 자료만 찾아 쉬운 말로 설명합니다. 사전자격 결과는 바꾸지 않습니다.", rule: "궁금한 조건", question: "질문", placeholder: "예: 왜 이 조건은 은행 확인이 필요한가요?", ask: "공식 근거 검색", asking: "근거 검색 중...", noProfile: "먼저 임시 금융 프로필을 입력해 주세요.", profile: "프로필 입력", noRules: "질문에 연결할 현재 유효한 조건이 없습니다.", error: "공식 근거 답변을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요.", sources: "검색된 공식 근거", retrieved: "확인일", noSource: "현재 상품과 조건에 맞는 공식 근거가 없습니다." },
  en: { eyebrow: "Official information assistant", title: "Ask the official financial documents", description: "Searches only reviewed official sources for this product and explains them in plain language. It never changes your pre-check result.", rule: "Condition to ask about", question: "Question", placeholder: "For example: Does an E-9 visa meet this product's residency requirement?", ask: "Search official evidence", asking: "Searching evidence...", noProfile: "Create a temporary financial profile first.", profile: "Create profile", noRules: "There is no current condition to ask about.", error: "A grounded answer could not be created. Please try again shortly.", sources: "Retrieved official evidence", retrieved: "Checked", noSource: "No official evidence matches this product and condition." },
  vi: { eyebrow: "Trợ lý thông tin chính thức", title: "Hỏi tài liệu tài chính chính thức", description: "Chỉ tìm các nguồn chính thức đã kiểm duyệt của sản phẩm và giải thích dễ hiểu. Không thay đổi kết quả kiểm tra sơ bộ.", rule: "Điều kiện cần hỏi", question: "Câu hỏi", placeholder: "Ví dụ: Visa E-9 có đáp ứng điều kiện cư trú của sản phẩm này không?", ask: "Tìm căn cứ chính thức", asking: "Đang tìm căn cứ...", noProfile: "Hãy tạo hồ sơ tài chính tạm thời trước.", profile: "Nhập hồ sơ", noRules: "Không có điều kiện hiện hành để đặt câu hỏi.", error: "Không thể tạo câu trả lời có căn cứ. Vui lòng thử lại sau.", sources: "Căn cứ chính thức đã tìm", retrieved: "Ngày xác nhận", noSource: "Không có căn cứ chính thức phù hợp với sản phẩm và điều kiện này." },
  zh: { eyebrow: "官方信息 AI 助手", title: "向官方金融文件提问", description: "仅检索本产品已审核的官方资料，并用通俗易懂的语言说明。不会更改资格预检结果。", rule: "想了解的条件", question: "问题", placeholder: "例如：为什么这个条件需要银行确认？", ask: "检索官方依据", asking: "正在检索依据…", noProfile: "请先填写临时金融资料。", profile: "填写资料", noRules: "目前没有可提问的有效条件。", error: "未能生成有依据的回答，请稍后再试。", sources: "检索到的官方依据", retrieved: "确认日期", noSource: "没有符合当前产品与条件的官方依据。" },
  ja: { eyebrow: "公式情報 AI アシスタント", title: "公式の金融文書に質問する", description: "この商品の審査済み公式資料のみを検索し、やさしい言葉で説明します。事前資格の結果は変更しません。", rule: "知りたい条件", question: "質問", placeholder: "例：なぜこの条件は銀行の確認が必要なのですか？", ask: "公式根拠を検索", asking: "根拠を検索中…", noProfile: "先に一時的な金融プロフィールを入力してください。", profile: "プロフィール入力", noRules: "質問に紐づけられる有効な条件がありません。", error: "根拠に基づく回答を作成できませんでした。しばらくしてからもう一度お試しください。", sources: "検索された公式根拠", retrieved: "確認日", noSource: "この商品と条件に合う公式根拠がありません。" },
  th: { eyebrow: "ผู้ช่วย AI ข้อมูลอย่างเป็นทางการ", title: "ถามเอกสารการเงินอย่างเป็นทางการ", description: "ค้นเฉพาะเอกสารอย่างเป็นทางการที่ตรวจสอบแล้วของผลิตภัณฑ์นี้ และอธิบายด้วยภาษาที่เข้าใจง่าย โดยไม่เปลี่ยนผลการตรวจสอบคุณสมบัติเบื้องต้น", rule: "เงื่อนไขที่ต้องการถาม", question: "คำถาม", placeholder: "ตัวอย่าง: ทำไมเงื่อนไขนี้ต้องให้ธนาคารยืนยัน?", ask: "ค้นหาหลักฐานอย่างเป็นทางการ", asking: "กำลังค้นหาหลักฐาน...", noProfile: "กรุณากรอกโปรไฟล์การเงินชั่วคราวก่อน", profile: "กรอกโปรไฟล์", noRules: "ไม่มีเงื่อนไขที่ใช้ได้สำหรับการถามในขณะนี้", error: "ไม่สามารถสร้างคำตอบที่มีหลักฐานอ้างอิงได้ กรุณาลองใหม่อีกครั้ง", sources: "หลักฐานอย่างเป็นทางการที่ค้นพบ", retrieved: "วันที่ตรวจสอบ", noSource: "ไม่พบหลักฐานอย่างเป็นทางการที่ตรงกับผลิตภัณฑ์และเงื่อนไขนี้" },
} as const;

const quickQuestions = {
  ko: ["왜 이 조건은 은행 확인이 필요한가요?", "어떤 서류를 준비해야 하나요?", "이 금융용어를 쉽게 설명해 주세요."],
  en: ["Why does this condition require bank confirmation?", "Which documents should I prepare?", "Explain this financial term in plain language."],
  vi: ["Tại sao điều kiện này cần ngân hàng xác nhận?", "Tôi cần chuẩn bị giấy tờ nào?", "Hãy giải thích thuật ngữ tài chính này dễ hiểu."],
  zh: ["为什么这个条件需要银行确认？", "我需要准备哪些材料？", "请用通俗的语言解释这个金融术语。"],
  ja: ["なぜこの条件は銀行の確認が必要ですか？", "どの書類を準備すればよいですか？", "この金融用語をやさしく説明してください。"],
  th: ["ทำไมเงื่อนไขนี้ต้องให้ธนาคารยืนยัน?", "ต้องเตรียมเอกสารอะไรบ้าง?", "ช่วยอธิบายศัพท์การเงินนี้แบบเข้าใจง่าย"],
} as const;

export function RagQuestionPanel({ productId, rules }: { productId: number; rules: ProductRule[] }) {
  const { locale } = useLocale();
  const uiLocale = locale;
  const text = copy[uiLocale];
  const [selectedRuleId, setSelectedRuleId] = useState(rules[0]?.id ? String(rules[0].id) : "");
  const [question, setQuestion] = useState("");
  const [missingProfile, setMissingProfile] = useState(false);
  const answer = useMutation({
    mutationFn: askOfficialDocuments,
    onError: (error: Error) => setMissingProfile(/profile|expired/i.test(error.message)),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const profileSessionId = localStorage.getItem("visafyProfileSessionId");
    if (!profileSessionId) {
      setMissingProfile(true);
      return;
    }
    setMissingProfile(false);
    const selectedRule = rules.find((rule) => String(rule.id) === selectedRuleId) ?? rules[0];
    if (!selectedRule) return;
    answer.mutate({ profileSessionId, productId, ruleKey: selectedRule.ruleKey, query: question, topK: 5 });
  }

  return <section className="mt-8 overflow-hidden rounded-panel border border-line bg-surface">
    <div className="p-6 sm:p-8"><p className="text-sm font-semibold text-accent">{text.eyebrow}</p><h2 className="mt-2 text-2xl font-bold text-ink">{text.title}</h2><p className="mt-2 text-sm leading-6 text-muted">{text.description}</p>
      {rules.length === 0 ? <p className="mt-6 rounded-card border border-line bg-surface-subtle p-4 text-sm text-muted">{text.noRules}</p> : <form className="mt-6 grid gap-4" onSubmit={submit}>
        <div className="flex flex-wrap gap-2">{quickQuestions[uiLocale].map((quick) => <button className="ui-button ui-button-secondary min-h-9 px-3 py-1.5 text-left text-xs" key={quick} onClick={() => setQuestion(quick)} type="button">{quick}</button>)}</div>
        <label className="ui-label">{text.rule}<select className="ui-input" value={selectedRuleId} onChange={(event) => setSelectedRuleId(event.target.value)}>{rules.map((rule) => <option key={rule.id} value={rule.id}>{officialText(uiLocale, rule.description)}</option>)}</select></label>
        <label className="ui-label">{text.question}<textarea className="ui-input min-h-28 font-normal" maxLength={1000} minLength={2} placeholder={text.placeholder} required value={question} onChange={(event) => setQuestion(event.target.value)} /></label>
        <button className="ui-button ui-button-primary w-fit" disabled={answer.isPending}>{answer.isPending ? text.asking : text.ask}</button>
      </form>}
      {missingProfile ? <div className="ui-alert-warning mt-5 flex flex-wrap items-center justify-between gap-3"><p>{text.noProfile}</p><Link className="ui-link" href="/profile">{text.profile} →</Link></div> : null}
      {answer.isError && !missingProfile ? <p className="ui-alert-danger mt-5" role="alert">{text.error}</p> : null}
    </div>
    {answer.data ? <div className="border-t border-line bg-surface p-6 sm:p-8" aria-live="polite">
      <div className="whitespace-pre-wrap rounded-card border border-line bg-surface-subtle p-5 text-sm leading-7 text-ink">{answer.data.answer}</div>
      <h3 className="mt-7 text-lg font-bold text-ink">{text.sources}</h3>
      {answer.data.documents.length === 0 ? <p className="mt-3 text-sm text-muted">{text.noSource}</p> : <div className="mt-3 grid gap-3">{answer.data.documents.map((document, index) => <article className="rounded-card border border-line p-4" key={`${document.documentId}-${index}`}><a className="ui-link" href={document.sourceUrl} rel="noreferrer" target="_blank">{document.title} ↗</a><p className="mt-2 line-clamp-4 whitespace-pre-line text-sm leading-6 text-muted">{document.content}</p><p className="mt-2 text-xs text-quiet">{institutionLabel(uiLocale, document.institution)} · {text.retrieved} {new Date(document.retrievedAt).toLocaleDateString()}</p></article>)}</div>}
    </div> : null}
  </section>;
}
