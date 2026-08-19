"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { askOfficialDocuments } from "@/services/rag";
import type { ProductRule } from "@/types/product";

const copy = {
  ko: { eyebrow: "AI-101 ~ AI-105", title: "공식 금융문서에 질문하기", description: "선택한 상품과 Rule의 공식 Source만 검색합니다. Eligibility 판정은 변경하지 않습니다.", rule: "질문할 Rule", question: "질문", placeholder: "예: E-9 비자는 이 상품의 체류자격 조건을 충족하나요?", ask: "공식 근거 검색", asking: "근거 검색 중...", noProfile: "먼저 임시 금융 프로필을 입력해 주세요.", profile: "프로필 입력", noRules: "질문에 연결할 현재 유효 Rule이 없습니다.", error: "공식 근거 답변을 생성하지 못했습니다. 관리자가 RAG 색인을 완료했는지 확인해 주세요.", engine: "Eligibility Engine 결과", ruleResult: "구조화된 Rule 결과", sources: "검색된 공식 근거", similarity: "검색 유사도", retrieved: "수집일", noSource: "현재 상품과 Rule에 맞는 색인된 공식 근거가 없습니다." },
  en: { eyebrow: "AI-101 ~ AI-105", title: "Ask the official financial documents", description: "Searches only official sources for this product and Rule. It never changes the Eligibility result.", rule: "Rule to ask about", question: "Question", placeholder: "For example: Does an E-9 visa meet this product's residency requirement?", ask: "Search official evidence", asking: "Searching evidence...", noProfile: "Create a temporary financial profile first.", profile: "Create profile", noRules: "There is no currently effective Rule to ask about.", error: "A grounded answer could not be created. Confirm that an administrator completed RAG indexing.", engine: "Eligibility Engine result", ruleResult: "Structured Rule result", sources: "Retrieved official evidence", similarity: "Retrieval similarity", retrieved: "Retrieved", noSource: "No indexed official evidence matches this product and Rule." },
  vi: { eyebrow: "AI-101 ~ AI-105", title: "Hỏi tài liệu tài chính chính thức", description: "Chỉ tìm kiếm nguồn chính thức của sản phẩm và Rule này. Không thay đổi kết quả Eligibility.", rule: "Rule cần hỏi", question: "Câu hỏi", placeholder: "Ví dụ: Visa E-9 có đáp ứng điều kiện cư trú của sản phẩm này không?", ask: "Tìm căn cứ chính thức", asking: "Đang tìm căn cứ...", noProfile: "Hãy tạo hồ sơ tài chính tạm thời trước.", profile: "Nhập hồ sơ", noRules: "Không có Rule hiện hành để đặt câu hỏi.", error: "Không thể tạo câu trả lời có căn cứ. Hãy kiểm tra quản trị viên đã lập chỉ mục RAG.", engine: "Kết quả Eligibility Engine", ruleResult: "Kết quả Rule có cấu trúc", sources: "Căn cứ chính thức đã tìm", similarity: "Độ tương đồng tìm kiếm", retrieved: "Ngày thu thập", noSource: "Không có căn cứ chính thức đã lập chỉ mục phù hợp với sản phẩm và Rule này." },
} as const;

export function RagQuestionPanel({ productId, rules }: { productId: number; rules: ProductRule[] }) {
  const { locale } = useLocale();
  const text = copy[locale];
  const [ruleKey, setRuleKey] = useState(rules[0]?.ruleKey ?? "");
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
    answer.mutate({ profileSessionId, productId, ruleKey, query: question, topK: 5 });
  }

  return <section className="mt-8 overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white">
    <div className="p-6 sm:p-8"><p className="text-sm font-bold text-violet-700">{text.eyebrow}</p><h2 className="mt-2 text-2xl font-bold text-slate-950">{text.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{text.description}</p>
      {rules.length === 0 ? <p className="mt-6 rounded-xl bg-slate-100 p-4 text-sm text-slate-600">{text.noRules}</p> : <form className="mt-6 grid gap-4" onSubmit={submit}>
        <label className="text-sm font-semibold text-slate-700">{text.rule}<select className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" value={ruleKey} onChange={(event) => setRuleKey(event.target.value)}>{rules.map((rule) => <option key={rule.id} value={rule.ruleKey}>{rule.ruleKey} · {rule.description}</option>)}</select></label>
        <label className="text-sm font-semibold text-slate-700">{text.question}<textarea className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal" maxLength={1000} minLength={2} placeholder={text.placeholder} required value={question} onChange={(event) => setQuestion(event.target.value)} /></label>
        <button className="w-fit rounded-xl bg-violet-700 px-5 py-3 font-bold text-white disabled:opacity-50" disabled={answer.isPending}>{answer.isPending ? text.asking : text.ask}</button>
      </form>}
      {missingProfile ? <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-100 p-4 text-sm text-amber-950"><p>{text.noProfile}</p><Link className="font-bold underline" href="/profile">{text.profile} →</Link></div> : null}
      {answer.isError && !missingProfile ? <p className="mt-5 rounded-xl bg-rose-100 p-4 text-sm text-rose-800">{text.error}</p> : null}
    </div>
    {answer.data ? <div className="border-t border-violet-200 bg-white p-6 sm:p-8" aria-live="polite">
      <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-950 p-4 text-white"><p className="text-xs text-slate-400">{text.engine}</p><p className="mt-1 font-bold">{answer.data.eligibilityStatus}</p></div><div className="rounded-xl bg-slate-100 p-4"><p className="text-xs text-slate-500">{text.ruleResult}</p><p className="mt-1 text-sm font-semibold">{answer.data.ruleResult}</p></div></div>
      <pre className="mt-5 whitespace-pre-wrap rounded-2xl bg-violet-50 p-5 font-sans text-sm leading-7 text-slate-800">{answer.data.answer}</pre>
      <h3 className="mt-7 text-lg font-bold">{text.sources}</h3>
      {answer.data.documents.length === 0 ? <p className="mt-3 text-sm text-slate-500">{text.noSource}</p> : <div className="mt-3 grid gap-3">{answer.data.documents.map((document, index) => <article className="rounded-xl border p-4" key={`${document.documentId}-${index}`}><div className="flex flex-wrap items-center justify-between gap-2"><a className="font-bold text-blue-700 underline" href={document.sourceUrl} rel="noreferrer" target="_blank">{document.title}</a><span className="text-xs text-slate-500">{text.similarity} {document.score.toFixed(2)}</span></div><p className="mt-2 line-clamp-4 whitespace-pre-line text-sm leading-6 text-slate-600">{document.content}</p><p className="mt-2 text-xs text-slate-400">{document.institution} · {text.retrieved} {new Date(document.retrievedAt).toLocaleDateString()}</p></article>)}</div>}
    </div> : null}
  </section>;
}
