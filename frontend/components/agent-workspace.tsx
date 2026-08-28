"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "@/components/providers/locale-provider";
import type { Locale } from "@/i18n/config";
import { getRecommendations } from "@/services/recommendation";
import { getProfile, updateProfile } from "@/services/profile";
import { askConsultation, getConsultationHistory } from "@/services/consultation";
import type { FinancialProduct } from "@/types/product";
import { parseProfileAnswer, ProfileFieldInput, profileFieldLabel, profileInput } from "@/components/profile-field-input";
import type { JourneyTarget } from "@/components/financial-journey-panel";

const copy = {
  ko: { eyebrow: "SSAFIN AGENT", title: "지금은 이 순서로 진행하세요", best: "가장 먼저 확인할 상품", candidates: "함께 살펴볼 상품", candidatesHint: "가능성이 있는 후보를 간단히 비교하세요.", reason: "이 상품을 먼저 보는 이유", prepare: "지금 준비할 한 가지", ask: "추가 정보 한 가지만 확인할게요", save: "답변 저장 후 다시 분석", saved: "답변을 반영해 추천을 다시 계산했습니다.", journey: "다음 단계: 준비사항과 신청순서 보기", product: "상품 상세 확인", chat: "공식문서에 직접 질문하기", chatHint: "필요할 때만 열어 상품의 승인된 공식 근거에 질문할 수 있습니다.", send: "질문 보내기", placeholder: "이 상품에 대해 궁금한 내용을 입력하세요.", source: "근거 신뢰도", fresh: "최근 검수", coverage: "근거 연결률", apply: "공식 신청 화면", official: "공식 정보 확인", noQuestion: "필요한 프로필 입력이 완료됐습니다. 이제 준비서류와 신청순서를 확인하세요.", noCandidates: "현재 함께 비교할 다른 후보가 없습니다.", noChat: "이 상품에는 질문에 연결할 승인 Rule이 없습니다.", met: "공개조건 확인", confirm: "은행 확인 필요", more: "정보 추가 필요" },
  en: { eyebrow: "SSAFIN AGENT", title: "Follow these steps now", best: "First product to review", candidates: "Other products to consider", candidatesHint: "Quickly compare other possible candidates.", reason: "Why review this first", prepare: "One thing to prepare now", ask: "I will check one more item", save: "Save answer and analyze again", saved: "Your answer was applied and recommendations were recalculated.", journey: "Next: review preparation and application steps", product: "View product details", chat: "Ask the official documents", chatHint: "Open only when needed to ask this product's approved official evidence.", send: "Send question", placeholder: "Ask about this product.", source: "Evidence confidence", fresh: "Last reviewed", coverage: "Evidence coverage", apply: "Official application", official: "Official information", noQuestion: "Your required profile information is complete. Review documents and application steps next.", noCandidates: "There are no other candidates to compare right now.", noChat: "This product has no approved Rule available for questions.", met: "Public conditions checked", confirm: "Bank check needed", more: "More information needed" },
  vi: { eyebrow: "SSAFIN AGENT", title: "Hãy thực hiện theo thứ tự này", best: "Sản phẩm nên xem trước", candidates: "Sản phẩm có thể xem thêm", candidatesHint: "So sánh nhanh các lựa chọn có khả năng phù hợp.", reason: "Lý do nên xem trước", prepare: "Một việc cần chuẩn bị ngay", ask: "Tôi sẽ hỏi thêm một mục", save: "Lưu và phân tích lại", saved: "Câu trả lời đã được áp dụng và đề xuất đã được tính lại.", journey: "Tiếp theo: xem chuẩn bị và quy trình đăng ký", product: "Xem chi tiết sản phẩm", chat: "Hỏi tài liệu chính thức", chatHint: "Chỉ mở khi cần hỏi căn cứ chính thức đã được phê duyệt của sản phẩm.", send: "Gửi câu hỏi", placeholder: "Hỏi về sản phẩm này.", source: "Độ tin cậy căn cứ", fresh: "Xác minh gần nhất", coverage: "Tỷ lệ căn cứ", apply: "Đăng ký chính thức", official: "Thông tin chính thức", noQuestion: "Thông tin hồ sơ cần thiết đã đầy đủ. Tiếp theo hãy xem giấy tờ và quy trình đăng ký.", noCandidates: "Hiện không có lựa chọn khác để so sánh.", noChat: "Sản phẩm này chưa có Rule đã duyệt để đặt câu hỏi.", met: "Đã kiểm tra điều kiện", confirm: "Cần ngân hàng xác nhận", more: "Cần thêm thông tin" },
  zh: { eyebrow: "SSAFIN AGENT", title: "现在请按此顺序进行", best: "最先查看的产品", candidates: "可一并查看的产品", candidatesHint: "快速比较其他可能合适的候选。", reason: "先看这个产品的理由", prepare: "现在要准备的一件事", ask: "我再确认一项信息", save: "保存回答并重新分析", saved: "已应用您的回答并重新计算推荐结果。", journey: "下一步：查看准备事项与申请顺序", product: "查看产品详情", chat: "直接向官方文件提问", chatHint: "仅在需要时展开，可就该产品已审核的官方依据提问。", send: "发送问题", placeholder: "请输入关于该产品的疑问。", source: "依据可信度", fresh: "最近审核", coverage: "依据关联率", apply: "官方申请页面", official: "官方信息确认", noQuestion: "所需的资料已填写完毕。接下来请确认所需材料与申请顺序。", noCandidates: "目前没有其他可比较的候选产品。", noChat: "该产品尚无可用于提问的已审核规则。", met: "已确认公开条件", confirm: "需银行确认", more: "需补充信息" },
  ja: { eyebrow: "SSAFIN AGENT", title: "今はこの順番で進めてください", best: "最初に確認する商品", candidates: "あわせて検討する商品", candidatesHint: "可能性のある候補を手早く比較しましょう。", reason: "この商品を先に見る理由", prepare: "今準備することひとつ", ask: "追加情報をひとつだけ確認します", save: "回答を保存して再分析", saved: "回答を反映して推薦を再計算しました。", journey: "次へ：準備事項と申請手順を見る", product: "商品の詳細を確認", chat: "公式文書に直接質問する", chatHint: "必要なときだけ開いて、この商品の承認済み公式根拠に質問できます。", send: "質問を送る", placeholder: "この商品について知りたいことを入力してください。", source: "根拠の信頼度", fresh: "最近の審査", coverage: "根拠の紐づけ率", apply: "公式の申請画面", official: "公式情報の確認", noQuestion: "必要なプロフィール入力が完了しました。次に必要書類と申請手順をご確認ください。", noCandidates: "現在、比較できる他の候補はありません。", noChat: "この商品には質問に紐づけられる承認済みルールがありません。", met: "公開条件を確認", confirm: "銀行の確認が必要", more: "情報の追加が必要" },
  th: { eyebrow: "SSAFIN AGENT", title: "ตอนนี้ให้ดำเนินการตามลำดับนี้", best: "ผลิตภัณฑ์ที่ควรดูก่อน", candidates: "ผลิตภัณฑ์ที่ควรดูควบคู่กัน", candidatesHint: "เปรียบเทียบตัวเลือกที่เป็นไปได้อย่างรวดเร็ว", reason: "เหตุผลที่ควรดูผลิตภัณฑ์นี้ก่อน", prepare: "สิ่งหนึ่งที่ต้องเตรียมตอนนี้", ask: "ขอตรวจสอบข้อมูลเพิ่มอีกหนึ่งอย่าง", save: "บันทึกคำตอบและวิเคราะห์ใหม่", saved: "นำคำตอบของคุณมาคำนวณคำแนะนำใหม่แล้ว", journey: "ขั้นต่อไป: ดูสิ่งที่ต้องเตรียมและลำดับการสมัคร", product: "ดูรายละเอียดผลิตภัณฑ์", chat: "ถามเอกสารอย่างเป็นทางการโดยตรง", chatHint: "เปิดเมื่อจำเป็น เพื่อถามหลักฐานอย่างเป็นทางการที่อนุมัติแล้วของผลิตภัณฑ์นี้", send: "ส่งคำถาม", placeholder: "กรอกสิ่งที่อยากทราบเกี่ยวกับผลิตภัณฑ์นี้", source: "ความน่าเชื่อถือของหลักฐาน", fresh: "ตรวจสอบล่าสุด", coverage: "อัตราการเชื่อมโยงหลักฐาน", apply: "หน้าสมัครอย่างเป็นทางการ", official: "ตรวจสอบข้อมูลอย่างเป็นทางการ", noQuestion: "ข้อมูลโปรไฟล์ที่จำเป็นครบถ้วนแล้ว ต่อไปกรุณาตรวจสอบเอกสารและลำดับการสมัคร", noCandidates: "ขณะนี้ไม่มีตัวเลือกอื่นให้เปรียบเทียบ", noChat: "ผลิตภัณฑ์นี้ยังไม่มีกฎที่อนุมัติแล้วสำหรับการถามคำถาม", met: "ตรวจสอบเงื่อนไขสาธารณะแล้ว", confirm: "ต้องให้ธนาคารยืนยัน", more: "ต้องการข้อมูลเพิ่มเติม" },
} as const;

export function AgentWorkspace({ products, onContinueJourney }: { products: FinancialProduct[]; onContinueJourney?: (focus: JourneyTarget) => void }) {
  const { locale } = useLocale(); const language = locale; const text = copy[language];
  const client = useQueryClient();
  const [identity, setIdentity] = useState<{ id: number; session: string } | null>();
  const [selectedProductId, setSelectedProductId] = useState<number>(); const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState(""); const [saved, setSaved] = useState(false);
  useEffect(() => { const id = Number(localStorage.getItem("visafyProfileId")); const session = localStorage.getItem("visafyProfileSessionId"); setIdentity(id && session ? { id, session } : null); }, []);
  const profile = useQuery({ queryKey: ["agent-profile", identity?.id], queryFn: () => getProfile(identity!.id, identity!.session), enabled: Boolean(identity) });
  const recommendations = useQuery({ queryKey: ["recommendations", identity?.session], queryFn: () => getRecommendations(identity!.session), enabled: Boolean(identity) });
  const top = recommendations.data?.recommended[0] ?? recommendations.data?.additionalInformationNeeded[0];
  const alternatives = [...(recommendations.data?.recommended ?? []), ...(recommendations.data?.additionalInformationNeeded ?? [])]
    .filter((item) => item.productId !== top?.productId)
    .slice(0, 4);
  const selected = products.find((item) => item.id === (selectedProductId ?? top?.productId)) ?? products[0];
  const topProduct = products.find((item) => item.id === top?.productId) ?? selected;
  useEffect(() => { if (top?.productId && selectedProductId === undefined) setSelectedProductId(top.productId); }, [top?.productId, selectedProductId]);
  const history = useQuery({ queryKey: ["consultation-history", identity?.session, selected?.id], queryFn: () => getConsultationHistory(identity!.session, selected!.id), enabled: Boolean(identity && selected) });
  const missingField = top?.nextPreparationField ?? null;
  const update = useMutation({ mutationFn: async () => { if (!profile.data || !identity || !missingField) return; const input = profileInput(profile.data); (input as Record<string, unknown>)[missingField] = parseProfileAnswer(missingField, answer); return updateProfile(identity.id, identity.session, input); }, onSuccess: async () => { setSaved(true); setAnswer(""); await client.invalidateQueries({ queryKey: ["agent-profile"] }); await client.invalidateQueries({ queryKey: ["recommendations"] }); await client.invalidateQueries({ queryKey: ["financial-journey"] }); } });
  const chat = useMutation({ mutationFn: () => askConsultation({ profileSessionId: identity!.session, productId: selected!.id, ruleKey: selected!.rules[0].ruleKey, query: question, topK: 5 }), onSuccess: async () => { setQuestion(""); await client.invalidateQueries({ queryKey: ["consultation-history", identity?.session, selected?.id] }); } });
  const reasons = useMemo(() => top?.recommendationReasonCodes.map((code) => reasonLabel(language, code, top.confirmedPublicConditions)) ?? [], [top, language]);
  if (identity === undefined || !identity || !top || !selected || !topProduct) return null;
  return <section className="mt-8 overflow-hidden rounded-panel border border-brand/30 bg-brand-soft/40" aria-labelledby="agent-workspace-title">
    <div className="p-6 sm:p-8"><p className="ui-eyebrow">{text.eyebrow}</p><h2 className="mt-2 text-2xl font-bold text-ink" id="agent-workspace-title">{text.title}</h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.75fr)]">
        <article className="rounded-card border border-brand/40 bg-surface p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-brand">{text.best}</p><p className="mt-2 text-sm font-semibold text-brand">{top.institution}</p><h3 className="mt-1 text-2xl font-bold text-ink">{top.productName}</h3></div><RecommendationStatus status={top.eligibilityStatus} text={text} /></div>
          <h4 className="mt-5 text-sm font-bold text-ink">{text.reason}</h4><ul className="mt-2 grid gap-1.5 text-sm text-muted">{reasons.slice(0, 3).map((item) => <li key={item}>✓ {item}</li>)}</ul>
          <div className={`mt-5 rounded-control border p-4 ${missingField ? "border-status-warning-border bg-status-warning-bg" : "border-status-info-border bg-status-info-bg"}`}><h4 className="text-sm font-bold text-ink">{text.prepare}</h4><p className="mt-1.5 text-sm leading-6 text-muted">{missingField ? profileFieldLabel(language, missingField) : text.noQuestion}</p>
            {missingField ? <form className="mt-3" onSubmit={(event) => { event.preventDefault(); update.mutate(); }}><label className="ui-label">{text.ask}<ProfileFieldInput field={missingField} value={answer} locale={locale} onChange={setAnswer} /></label><button className="ui-button ui-button-primary mt-3" disabled={!answer || update.isPending}>{text.save}</button></form> : null}{saved ? <p className="mt-3 text-sm font-semibold text-status-success">✓ {text.saved}</p> : null}</div>
          <div className="mt-5 flex flex-wrap gap-3"><button className="ui-button ui-button-primary" onClick={() => onContinueJourney?.({ code: journeyCode(topProduct.productCategory), productId: top.productId })} type="button">{text.journey} ↓</button><Link className="ui-button ui-button-secondary" href={`/products/${top.productId}`}>{text.product} →</Link></div>
        </article>
        <aside className="rounded-card border border-line bg-surface p-5"><h3 className="font-bold text-ink">{text.candidates}</h3><p className="mt-1 text-xs leading-5 text-muted">{text.candidatesHint}</p>{alternatives.length ? <ol className="mt-4 divide-y divide-line">{alternatives.map((item, index) => <li className="py-3 first:pt-0 last:pb-0" key={item.productId}><Link className="group flex items-center justify-between gap-3" href={`/products/${item.productId}`}><span className="min-w-0"><span className="block text-xs font-semibold text-brand">#{index + 2} · {item.institution}</span><span className="mt-1 block truncate text-sm font-bold text-ink group-hover:text-brand">{item.productName}</span></span><span className="shrink-0 text-brand">→</span></Link><div className="mt-2"><RecommendationStatus status={item.eligibilityStatus} text={text} compact /></div></li>)}</ol> : <p className="mt-4 text-sm text-muted">{text.noCandidates}</p>}</aside>
      </div>
      <div className="mt-4 rounded-card border border-line bg-surface p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-ink">{text.source}</h3><p className="mt-1 text-xs text-muted">{text.fresh}: {new Date(topProduct.sourceTrust.lastVerifiedAt).toLocaleDateString()} · {text.coverage}: {topProduct.sourceTrust.evidenceCoveragePercent}%</p></div><div className="flex gap-2">{topProduct.officialApplicationUrl ? <a className="ui-button ui-button-primary" href={topProduct.officialApplicationUrl} rel="noreferrer" target="_blank">{text.apply} ↗</a> : null}<a className="ui-button ui-button-secondary" href={topProduct.sourceUrl} rel="noreferrer" target="_blank">{text.official} ↗</a></div></div></div>
    </div>
    <details className="border-t border-line bg-surface p-6 sm:p-8"><summary className="cursor-pointer list-none"><span className="flex items-center justify-between gap-4"><span><strong className="text-lg text-ink">{text.chat}</strong><span className="mt-1 block text-sm text-muted">{text.chatHint}</span></span><span aria-hidden="true" className="text-xl text-brand">＋</span></span></summary><div className="mt-5"><select className="ui-input" value={selected.id} onChange={(event) => setSelectedProductId(Number(event.target.value))}>{products.map((item) => <option key={item.id} value={item.id}>{item.institution} · {item.productName}</option>)}</select>
      {selected.rules.length ? <><div className="mt-4 max-h-80 space-y-3 overflow-y-auto" aria-live="polite">{history.data?.map((item) => <article className="rounded-card border border-line p-4" key={item.id}><p className="text-sm font-bold text-brand">Q. {item.question}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{item.answer}</p></article>)}</div><form className="mt-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); chat.mutate(); }}><input className="ui-input" maxLength={1000} minLength={2} placeholder={text.placeholder} required value={question} onChange={(event) => setQuestion(event.target.value)} /><button className="ui-button ui-button-primary shrink-0" disabled={chat.isPending}>{text.send}</button></form></> : <p className="ui-alert-warning mt-4">{text.noChat}</p>}</div>
    </details>
  </section>;
}

function RecommendationStatus({ status, text, compact = false }: { status: string; text: (typeof copy)[keyof typeof copy]; compact?: boolean }) {
  const style = status === "PUBLIC_CONDITIONS_MET" ? "border-status-success-border bg-status-success-bg text-status-success" : status === "NEED_BANK_CONFIRMATION" ? "border-status-warning-border bg-status-warning-bg text-status-warning" : "border-status-neutral-border bg-status-neutral-bg text-status-neutral";
  const label = status === "PUBLIC_CONDITIONS_MET" ? text.met : status === "NEED_BANK_CONFIRMATION" ? text.confirm : text.more;
  return <span className={`inline-flex rounded-full border font-semibold ${compact ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"} ${style}`}>{label}</span>;
}

function journeyCode(category: FinancialProduct["productCategory"]) {
  if (category === "DEMAND_DEPOSIT") return "DEMAND_DEPOSIT_ACCOUNT";
  if (category === "DEBIT_CARD") return "DEBIT_CARD";
  if (category === "SAVINGS" || category === "TIME_DEPOSIT") return "SAVINGS";
  if (category === "REMITTANCE") return "REMITTANCE";
  if (category === "CREDIT_CARD") return "BUILD_CREDIT";
  if (["PERSONAL_LOAN", "HOUSING_LOAN", "POLICY_FINANCE"].includes(category)) return "LOAN_AND_HOUSING";
  if (category === "SECURITIES") return "INVESTMENT";
  return "IDENTITY_PREPARATION";
}

function reasonLabel(language: Locale, code: string, count: number) {
  const labels: Record<string, Record<Locale, string>> = {
    FINANCIAL_PURPOSE_MATCH: { ko: "선택한 금융 목적과 일치합니다.", en: "It matches your financial purpose.", vi: "Phù hợp với mục tiêu tài chính của bạn.", zh: "与您选择的金融目的一致。", ja: "選択した金融目的と一致します。", th: "ตรงกับวัตถุประสงค์ทางการเงินที่คุณเลือก" },
    PUBLIC_CONDITIONS_CONFIRMED: { ko: `공개조건 ${count}개를 확인했습니다.`, en: `${count} public conditions were confirmed.`, vi: `Đã xác nhận ${count} điều kiện công khai.`, zh: `已确认 ${count} 项公开条件。`, ja: `公開条件を${count}件確認しました。`, th: `ยืนยันเงื่อนไขสาธารณะแล้ว ${count} รายการ` },
    NO_EXPLICIT_FAILURE: { ko: "명시적으로 충족하지 못한 조건이 없습니다.", en: "No explicit failed condition was found.", vi: "Không có điều kiện không đạt rõ ràng.", zh: "没有明确未满足的条件。", ja: "明示的に満たしていない条件はありません。", th: "ไม่พบเงื่อนไขที่ไม่ผ่านอย่างชัดเจน" },
    NO_UNKNOWN_CONDITION: { ko: "공개되지 않은 조건이 없습니다.", en: "No unpublished condition was found.", vi: "Không có điều kiện chưa công khai.", zh: "没有未公开的条件。", ja: "公開されていない条件はありません。", th: "ไม่พบเงื่อนไขที่ไม่เปิดเผย" },
  };
  return labels[code]?.[language] ?? code;
}
