"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "@/components/providers/locale-provider";
import { toLegacyLocale } from "@/i18n/config";
import { getRecommendations } from "@/services/recommendation";
import { getProfile, updateProfile } from "@/services/profile";
import { askConsultation, getConsultationHistory } from "@/services/consultation";
import type { FinancialProduct } from "@/types/product";
import type { TempProfile, TempProfileInput } from "@/types/profile";

const copy = {
  ko: { eyebrow: "SSAFIN AGENT", title: "SSAFIN이 제안하는 다음 행동", reason: "추천 이유", prepare: "지금 준비할 한 가지", ask: "한 번에 하나씩 확인할게요", save: "답변 저장 후 다시 분석", saved: "답변을 반영해 추천을 다시 계산했습니다.", chat: "공식문서에 이어서 질문하기", send: "질문 보내기", placeholder: "이 상품에 대해 궁금한 내용을 입력하세요.", source: "근거 신뢰도", fresh: "최근 검수", coverage: "근거 연결률", apply: "공식 신청 화면", official: "공식 정보 확인", noQuestion: "현재 추가로 필요한 프로필 정보가 없습니다.", noChat: "이 상품에는 질문에 연결할 승인 Rule이 없습니다." },
  en: { eyebrow: "SSAFIN AGENT", title: "SSAFIN's suggested next action", reason: "Why this is recommended", prepare: "One thing to prepare now", ask: "I will ask one item at a time", save: "Save answer and analyze again", saved: "Your answer was applied and recommendations were recalculated.", chat: "Continue asking the official documents", send: "Send question", placeholder: "Ask about this product.", source: "Evidence confidence", fresh: "Last reviewed", coverage: "Evidence coverage", apply: "Official application", official: "Official information", noQuestion: "No additional profile information is currently required.", noChat: "This product has no approved Rule available for questions." },
  vi: { eyebrow: "SSAFIN AGENT", title: "Hành động tiếp theo do SSAFIN đề xuất", reason: "Lý do đề xuất", prepare: "Một việc cần chuẩn bị ngay", ask: "Tôi sẽ hỏi từng mục", save: "Lưu và phân tích lại", saved: "Câu trả lời đã được áp dụng và đề xuất đã được tính lại.", chat: "Tiếp tục hỏi tài liệu chính thức", send: "Gửi câu hỏi", placeholder: "Hỏi về sản phẩm này.", source: "Độ tin cậy căn cứ", fresh: "Xác minh gần nhất", coverage: "Tỷ lệ căn cứ", apply: "Đăng ký chính thức", official: "Thông tin chính thức", noQuestion: "Hiện không cần thêm thông tin hồ sơ.", noChat: "Sản phẩm này chưa có Rule đã duyệt để đặt câu hỏi." },
} as const;

const fieldLabels: Record<string, Record<"ko" | "en" | "vi", string>> = {
  visaType: { ko: "체류자격은 무엇인가요?", en: "What is your status of stay?", vi: "Tư cách lưu trú của bạn là gì?" },
  visaExpiry: { ko: "비자 만료일은 언제인가요?", en: "When does your visa expire?", vi: "Visa của bạn hết hạn khi nào?" },
  birthDate: { ko: "생년월일은 언제인가요?", en: "What is your date of birth?", vi: "Ngày sinh của bạn là gì?" },
  residencyStartDate: { ko: "한국 체류 시작일은 언제인가요?", en: "When did you start residing in Korea?", vi: "Bạn bắt đầu cư trú tại Hàn Quốc khi nào?" },
  monthlyIncome: { ko: "월 소득은 얼마인가요?", en: "What is your monthly income in KRW?", vi: "Thu nhập hàng tháng của bạn là bao nhiêu KRW?" },
  employmentDurationMonths: { ko: "현재 근속기간은 몇 개월인가요?", en: "How many months have you worked at your current job?", vi: "Bạn đã làm công việc hiện tại bao nhiêu tháng?" },
  desiredAmount: { ko: "희망 금액은 얼마인가요?", en: "What amount do you want in KRW?", vi: "Số tiền mong muốn là bao nhiêu KRW?" },
  desiredMonthlyAmount: { ko: "월 납입 희망금액은 얼마인가요?", en: "What monthly amount do you want in KRW?", vi: "Số tiền gửi hàng tháng mong muốn là bao nhiêu KRW?" },
  residentStatus: { ko: "한국 세법·은행 기준의 거주자 상태를 알고 있나요?", en: "What is your resident status for this financial service?", vi: "Tình trạng cư trú của bạn đối với dịch vụ này là gì?" },
  occupation: { ko: "현재 직업은 무엇인가요?", en: "What is your occupation?", vi: "Nghề nghiệp hiện tại của bạn là gì?" },
  employmentType: { ko: "현재 고용형태는 무엇인가요?", en: "What is your employment type?", vi: "Hình thức việc làm của bạn là gì?" },
  hasExistingProductAccount: { ko: "이 상품 계좌를 이미 보유하고 있나요?", en: "Do you already have this product account?", vi: "Bạn đã có tài khoản sản phẩm này chưa?" },
  hasResidenceCard: { ko: "외국인등록증·체류카드를 보유하고 있나요?", en: "Do you have a residence card?", vi: "Bạn có thẻ cư trú không?" },
  hasPassport: { ko: "여권을 보유하고 있나요?", en: "Do you have a passport?", vi: "Bạn có hộ chiếu không?" },
  hasDomesticPhone: { ko: "국내 휴대전화를 보유하고 있나요?", en: "Do you have a Korean mobile phone?", vi: "Bạn có điện thoại Hàn Quốc không?" },
  canDomesticPhoneVerify: { ko: "국내 휴대전화로 본인인증할 수 있나요?", en: "Can you verify your identity with a Korean phone?", vi: "Bạn có thể xác minh bằng điện thoại Hàn Quốc không?" },
  hasKoreanBankAccount: { ko: "국내 입출금계좌를 보유하고 있나요?", en: "Do you have a Korean demand-deposit account?", vi: "Bạn có tài khoản thanh toán Hàn Quốc không?" },
  hasKoreanCreditHistory: { ko: "국내 신용이력이 있나요?", en: "Do you have Korean credit history?", vi: "Bạn có lịch sử tín dụng tại Hàn Quốc không?" },
  preferredChannel: { ko: "선호하는 신청 채널은 무엇인가요?", en: "Which application channel do you prefer?", vi: "Bạn ưu tiên kênh đăng ký nào?" },
  remittanceCountry: { ko: "송금할 국가는 어디인가요?", en: "Which country will receive the remittance?", vi: "Bạn muốn chuyển tiền đến quốc gia nào?" },
};

export function AgentWorkspace({ products }: { products: FinancialProduct[] }) {
  const { locale } = useLocale(); const language = toLegacyLocale(locale); const text = copy[language];
  const client = useQueryClient();
  const [identity, setIdentity] = useState<{ id: number; session: string } | null>();
  const [selectedProductId, setSelectedProductId] = useState<number>(); const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState(""); const [saved, setSaved] = useState(false);
  useEffect(() => { const id = Number(localStorage.getItem("visafyProfileId")); const session = localStorage.getItem("visafyProfileSessionId"); setIdentity(id && session ? { id, session } : null); }, []);
  const profile = useQuery({ queryKey: ["agent-profile", identity?.id], queryFn: () => getProfile(identity!.id, identity!.session), enabled: Boolean(identity) });
  const recommendations = useQuery({ queryKey: ["recommendations", identity?.session], queryFn: () => getRecommendations(identity!.session), enabled: Boolean(identity) });
  const top = recommendations.data?.recommended[0] ?? recommendations.data?.additionalInformationNeeded[0];
  const selected = products.find((item) => item.id === (selectedProductId ?? top?.productId)) ?? products[0];
  useEffect(() => { if (top?.productId && selectedProductId === undefined) setSelectedProductId(top.productId); }, [top?.productId, selectedProductId]);
  const history = useQuery({ queryKey: ["consultation-history", identity?.session, selected?.id], queryFn: () => getConsultationHistory(identity!.session, selected!.id), enabled: Boolean(identity && selected) });
  const missingField = top?.nextPreparationField ?? null;
  const update = useMutation({ mutationFn: async () => { if (!profile.data || !identity || !missingField) return; const input = profileInput(profile.data); (input as Record<string, unknown>)[missingField] = parseAnswer(missingField, answer); return updateProfile(identity.id, identity.session, input); }, onSuccess: async () => { setSaved(true); setAnswer(""); await client.invalidateQueries({ queryKey: ["agent-profile"] }); await client.invalidateQueries({ queryKey: ["recommendations"] }); await client.invalidateQueries({ queryKey: ["financial-journey"] }); } });
  const chat = useMutation({ mutationFn: () => askConsultation({ profileSessionId: identity!.session, productId: selected!.id, ruleKey: selected!.rules[0].ruleKey, query: question, topK: 5 }), onSuccess: async () => { setQuestion(""); await client.invalidateQueries({ queryKey: ["consultation-history", identity?.session, selected?.id] }); } });
  const reasons = useMemo(() => top?.recommendationReasonCodes.map((code) => reasonLabel(language, code, top.confirmedPublicConditions)) ?? [], [top, language]);
  if (identity === undefined || !identity || !top || !selected) return null;
  return <section className="mt-8 overflow-hidden rounded-panel border border-brand/30 bg-brand-soft/40" aria-labelledby="agent-workspace-title">
    <div className="p-6 sm:p-8"><p className="ui-eyebrow">{text.eyebrow}</p><h2 className="mt-2 text-2xl font-bold text-ink" id="agent-workspace-title">{text.title}</h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-2"><article className="rounded-card border border-line bg-surface p-5"><p className="text-xs font-bold text-brand">{top.institution}</p><h3 className="mt-1 text-xl font-bold text-ink">{top.productName}</h3><h4 className="mt-4 text-sm font-bold text-ink">{text.reason}</h4><ul className="mt-2 space-y-1 text-sm text-muted">{reasons.map((item) => <li key={item}>✓ {item}</li>)}</ul><h4 className="mt-4 text-sm font-bold text-ink">{text.prepare}</h4><p className="mt-2 text-sm text-muted">{missingField ? fieldLabel(language, missingField) : text.noQuestion}</p></article>
        <article className="rounded-card border border-line bg-surface p-5"><h3 className="font-bold text-ink">{text.ask}</h3>{missingField ? <form className="mt-4" onSubmit={(event) => { event.preventDefault(); update.mutate(); }}><label className="ui-label">{fieldLabel(language, missingField)}<AgentInput field={missingField} value={answer} onChange={setAnswer} /></label><button className="ui-button ui-button-primary mt-4" disabled={!answer || update.isPending}>{text.save}</button></form> : <p className="mt-3 text-sm text-muted">{text.noQuestion}</p>}{saved ? <p className="ui-alert-success mt-3 text-sm">{text.saved}</p> : null}</article></div>
      <div className="mt-4 rounded-card border border-line bg-surface p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-ink">{text.source}</h3><p className="mt-1 text-xs text-muted">{text.fresh}: {new Date(selected.sourceTrust.lastVerifiedAt).toLocaleDateString()} · {text.coverage}: {selected.sourceTrust.evidenceCoveragePercent}%</p></div><div className="flex gap-2">{selected.officialApplicationUrl ? <a className="ui-button ui-button-primary" href={selected.officialApplicationUrl} rel="noreferrer" target="_blank">{text.apply} ↗</a> : null}<a className="ui-button ui-button-secondary" href={selected.sourceUrl} rel="noreferrer" target="_blank">{text.official} ↗</a></div></div></div>
    </div>
    <div className="border-t border-line bg-surface p-6 sm:p-8"><h3 className="text-xl font-bold text-ink">{text.chat}</h3><select className="ui-input mt-4" value={selected.id} onChange={(event) => setSelectedProductId(Number(event.target.value))}>{products.map((item) => <option key={item.id} value={item.id}>{item.institution} · {item.productName}</option>)}</select>
      {selected.rules.length ? <><div className="mt-4 max-h-80 space-y-3 overflow-y-auto" aria-live="polite">{history.data?.map((item) => <article className="rounded-card border border-line p-4" key={item.id}><p className="text-sm font-bold text-brand">Q. {item.question}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{item.answer}</p></article>)}</div><form className="mt-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); chat.mutate(); }}><input className="ui-input" maxLength={1000} minLength={2} placeholder={text.placeholder} required value={question} onChange={(event) => setQuestion(event.target.value)} /><button className="ui-button ui-button-primary shrink-0" disabled={chat.isPending}>{text.send}</button></form></> : <p className="ui-alert-warning mt-4">{text.noChat}</p>}
    </div>
  </section>;
}

function profileInput(profile: TempProfile): TempProfileInput { const { id: _id, sessionId: _session, expiresAt: _expiry, ...input } = profile; return input; }
function parseAnswer(field: string, value: string): unknown { if (["monthlyIncome", "employmentDurationMonths", "desiredAmount", "desiredMonthlyAmount"].includes(field)) return Number(value); if (field.startsWith("has") || field.startsWith("can")) return value === "true"; return value; }
function AgentInput({ field, value, onChange }: { field: string; value: string; onChange: (value: string) => void }) { if (field.startsWith("has") || field.startsWith("can")) return <select className="ui-input" value={value} onChange={(e) => onChange(e.target.value)}><option value="">-</option><option value="true">Yes</option><option value="false">No</option></select>; if (field === "residentStatus") return <select className="ui-input" value={value} onChange={(e) => onChange(e.target.value)}><option value="">-</option><option value="RESIDENT">Resident</option><option value="NON_RESIDENT">Non-resident</option><option value="UNKNOWN">Unknown</option></select>; if (field === "preferredChannel") return <select className="ui-input" value={value} onChange={(e) => onChange(e.target.value)}><option value="">-</option><option value="BRANCH">Branch</option><option value="ONLINE">Online / Mobile</option></select>; if (field === "visaType") return <select className="ui-input" value={value} onChange={(e) => onChange(e.target.value)}><option value="">-</option>{["D-2", "D-4", "E-7", "E-9", "F-2", "F-5", "F-6"].map((code) => <option key={code} value={code}>{code}</option>)}</select>; const type = field.toLowerCase().includes("date") || field === "visaExpiry" ? "date" : ["monthlyIncome", "employmentDurationMonths", "desiredAmount", "desiredMonthlyAmount"].includes(field) ? "number" : "text"; return <input className="ui-input" min={type === "number" ? 0 : undefined} type={type} value={value} onChange={(e) => onChange(e.target.value)} />; }
function fieldLabel(language: "ko" | "en" | "vi", field: string) { return fieldLabels[field]?.[language] ?? (language === "ko" ? `${field} 정보를 알려주세요.` : `Please provide ${field}.`); }
function reasonLabel(language: "ko" | "en" | "vi", code: string, count: number) { const labels = { FINANCIAL_PURPOSE_MATCH: ["선택한 금융 목적과 일치합니다.", "It matches your financial purpose.", "Phù hợp với mục tiêu tài chính của bạn."], PUBLIC_CONDITIONS_CONFIRMED: [`공개조건 ${count}개를 확인했습니다.`, `${count} public conditions were confirmed.`, `Đã xác nhận ${count} điều kiện công khai.`], NO_EXPLICIT_FAILURE: ["명시적으로 충족하지 못한 조건이 없습니다.", "No explicit failed condition was found.", "Không có điều kiện không đạt rõ ràng."], NO_UNKNOWN_CONDITION: ["공개되지 않은 조건이 없습니다.", "No unpublished condition was found.", "Không có điều kiện chưa công khai."] } as const; return (labels as Record<string, readonly string[]>)[code]?.[{ ko: 0, en: 1, vi: 2 }[language]] ?? code; }
