"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { createRuleCandidate, createSource, getRuleCandidates, getSources, reviewRule, reviewSource } from "@/services/data-pipeline";
import { getAdminProducts } from "@/services/product";
import type { ReviewStatus } from "@/types/data-pipeline";

const badge: Record<ReviewStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-slate-200 text-slate-700",
  NEED_REVIEW: "bg-rose-100 text-rose-800",
  EXPIRED: "bg-zinc-200 text-zinc-700",
};

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2";

export default function SourceAdminPage() {
  const queryClient = useQueryClient();
  const sources = useQuery({ queryKey: ["sources"], queryFn: getSources });
  const rules = useQuery({ queryKey: ["rule-candidates"], queryFn: getRuleCandidates });
  const products = useQuery({ queryKey: ["admin-products"], queryFn: getAdminProducts });
  const [message, setMessage] = useState("");

  const sourceMutation = useMutation({
    mutationFn: createSource,
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["sources"] }); setMessage("Source와 Snapshot을 저장했습니다."); },
    onError: (error: Error) => setMessage(error.message),
  });
  const ruleMutation = useMutation({
    mutationFn: createRuleCandidate,
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["rule-candidates"] }); setMessage("Rule Candidate를 PENDING으로 저장했습니다."); },
    onError: (error: Error) => setMessage(error.message),
  });
  const reviewMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) => reviewRule(id, body),
    onSuccess: (rule) => { void queryClient.invalidateQueries({ queryKey: ["rule-candidates"] }); setMessage(`검수 결과: ${rule.reviewStatus}`); },
    onError: (error: Error) => setMessage(error.message),
  });
  const sourceReviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => reviewSource(id, status),
    onSuccess: (source) => { void queryClient.invalidateQueries({ queryKey: ["sources"] }); setMessage(`Source 검수 결과: ${source.reviewStatus}`); },
    onError: (error: Error) => setMessage(error.message),
  });

  function submitSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    sourceMutation.mutate({
      institution: data.get("institution"), sourceType: data.get("sourceType"), title: data.get("title"),
      sourceUrl: data.get("sourceUrl"), snapshotText: data.get("snapshotText"),
      validFrom: data.get("validFrom") || null, validTo: data.get("validTo") || null,
    });
  }

  function submitRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    ruleMutation.mutate({
      sourceDocumentId: Number(data.get("sourceDocumentId")), productCode: data.get("productCode"),
      ruleKey: data.get("ruleKey"), operator: data.get("operator"), ruleValue: data.get("ruleValue"),
      ruleLevel: data.get("ruleLevel"), mandatory: data.get("mandatory") === "on",
      sourceExcerpt: data.get("sourceExcerpt"), sourceLocator: data.get("sourceLocator"),
      validFrom: data.get("validFrom") || null, validTo: data.get("validTo") || null,
      description: data.get("description"), confidence: Number(data.get("confidence")),
    });
  }

  function approveWithChanges(id: number, operator: string, value: string, excerpt: string) {
    const correctedValue = window.prompt("수정할 Rule value를 입력하세요.", value);
    if (correctedValue === null) return;
    reviewMutation.mutate({ id, body: { action: "APPROVE_WITH_CHANGES", operator, ruleValue: correctedValue, sourceExcerpt: excerpt } });
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-sm font-semibold text-teal-700">DATA-001 ~ DATA-006</p>
      <h1 className="mt-2 text-3xl font-bold">공식 Source · Rule 검수</h1>
      <p className="mt-3 text-slate-600">공식 원문을 Snapshot으로 저장하고 AI 추출 후보를 사람이 승인합니다. confidence는 가입 가능 확률이 아닙니다.</p>
      {message ? <div className="mt-6 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white">{message}</div> : null}

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <form className="space-y-4 rounded-xl border bg-white p-6 shadow-sm" onSubmit={submitSource}>
          <h2 className="text-xl font-bold">1. 공식 Source 등록</h2>
          <input className={inputClass} name="institution" placeholder="기관명 (예: KB국민은행)" required />
          <select className={inputClass} name="sourceType" defaultValue="PRODUCT_PAGE">
            <option value="PRODUCT_PAGE">은행 공식 상품 페이지</option><option value="PRODUCT_DESCRIPTION">상품설명서</option>
            <option value="TERMS">약관</option><option value="FAQ">은행 FAQ</option><option value="PUBLIC_GUIDE">공공 가이드</option>
          </select>
          <input className={inputClass} name="title" placeholder="문서 제목" required />
          <input className={inputClass} name="sourceUrl" type="url" placeholder="https://obank.kbstar.com/..." required />
          <textarea className={`${inputClass} min-h-36`} name="snapshotText" placeholder="수집 당시 공식 문서의 텍스트를 붙여 넣으세요." required />
          <div className="grid grid-cols-2 gap-3"><label className="text-sm">유효 시작일<input className={inputClass} name="validFrom" type="date" /></label><label className="text-sm">유효 종료일<input className={inputClass} name="validTo" type="date" /></label></div>
          <button className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={sourceMutation.isPending}>Source 저장</button>
        </form>

        <form className="space-y-4 rounded-xl border bg-white p-6 shadow-sm" onSubmit={submitRule}>
          <h2 className="text-xl font-bold">2. Rule Candidate 등록</h2>
          <select className={inputClass} name="sourceDocumentId" required defaultValue=""><option value="" disabled>근거 Source 선택</option>{sources.data?.map((source) => <option key={source.id} value={source.id}>{source.institution} · {source.title}</option>)}</select>
          <select className={inputClass} name="productCode" required defaultValue=""><option value="" disabled>등록 상품 선택</option>{products.data?.map((product) => <option key={product.id} value={product.productCode}>{product.institution} · {product.productName} ({product.productCode})</option>)}</select>
          <input className={inputClass} name="ruleKey" list="rule-key-options" placeholder="Rule Key (예: VISA_TYPE)" required />
          <datalist id="rule-key-options"><option value="AGE" /><option value="VISA_REMAINING_MONTH" /><option value="VISA_TYPE" /><option value="DOMESTIC_INCOME_MONTH" /><option value="BANK_CREDIT_REVIEW" /></datalist>
          <div className="grid grid-cols-2 gap-3"><select className={inputClass} name="operator"><option>IN</option><option>NOT_IN</option><option>EQ</option><option>NE</option><option>GT</option><option>GTE</option><option>LT</option><option>LTE</option><option>EXISTS</option></select><select className={inputClass} name="ruleLevel"><option>HARD</option><option>EXTERNAL_CHECK</option><option>UNKNOWN</option></select></div>
          <div className="rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600"><strong>HARD</strong> 사용자 입력과 직접 비교 · <strong>EXTERNAL_CHECK</strong> 은행/기관 확인 필요 · <strong>UNKNOWN</strong> 세부 기준 비공개</div>
          <input className={inputClass} name="ruleValue" defaultValue='["F-2","F-5"]' required />
          <label className="flex items-center gap-2 text-sm"><input name="mandatory" type="checkbox" defaultChecked /> 필수 조건(mandatory)</label>
          <input className={inputClass} name="description" placeholder="조건 설명 (예: 허용 체류자격)" required />
          <textarea className={inputClass} name="sourceExcerpt" placeholder="원문 근거 문장" required />
          <input className={inputClass} name="sourceLocator" placeholder="근거 위치 (예: 상품설명서 p.3 가입대상)" required />
          <div className="grid grid-cols-2 gap-3"><label className="text-sm">Rule 유효 시작일<input className={inputClass} name="validFrom" type="date" /></label><label className="text-sm">Rule 유효 종료일<input className={inputClass} name="validTo" type="date" /></label></div>
          <label className="text-sm">AI 추출 신뢰도 (0~1)<input className={inputClass} max="1" min="0" name="confidence" step="0.01" type="number" defaultValue="0.93" required /></label>
          <button className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={ruleMutation.isPending}>PENDING 후보 저장</button>
        </form>
      </section>

      <section className="mt-12"><h2 className="text-2xl font-bold">Source Snapshot</h2><div className="mt-4 grid gap-4">{sources.data?.map((source) => <article className="rounded-xl border bg-white p-5" key={source.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">{source.institution} · {source.title}</h3><a className="text-sm text-teal-700 underline" href={source.sourceUrl} rel="noreferrer" target="_blank">공식 원문 열기</a></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${badge[source.reviewStatus]}`}>{source.reviewStatus}</span></div><p className="mt-3 break-all text-xs text-slate-500">SHA-256 {source.contentHash} · 최근 검증 {new Date(source.lastVerifiedAt).toLocaleString()}</p><details className="mt-3"><summary className="cursor-pointer font-semibold">저장 Snapshot 보기</summary><pre className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm">{source.snapshotText}</pre></details>{source.reviewStatus !== "EXPIRED" ? <div className="mt-4 flex gap-2"><button className="rounded bg-emerald-700 px-3 py-2 text-sm text-white" onClick={() => sourceReviewMutation.mutate({ id: source.id, status: "APPROVED" })}>공식 Source 승인</button><button className="rounded bg-amber-600 px-3 py-2 text-sm text-white" onClick={() => sourceReviewMutation.mutate({ id: source.id, status: "NEED_REVIEW" })}>재검토</button><button className="rounded bg-slate-700 px-3 py-2 text-sm text-white" onClick={() => sourceReviewMutation.mutate({ id: source.id, status: "REJECTED" })}>거절</button></div> : null}</article>)}</div></section>

      <section className="mt-12"><h2 className="text-2xl font-bold">Human Verification</h2><div className="mt-4 grid gap-4">{rules.data?.map((rule) => <article className="rounded-xl border bg-white p-5" key={rule.id}><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-bold">{rule.productCode} · {rule.ruleKey}</h3><p className="text-sm text-slate-500">{rule.description} · 근거: {rule.sourceTitle}</p></div><span className={`h-fit rounded-full px-3 py-1 text-xs font-bold ${badge[rule.reviewStatus]}`}>{rule.reviewStatus}</span></div><div className="mt-4 rounded-lg bg-slate-50 p-4 font-mono text-sm">{rule.operator} {rule.ruleValue} · {rule.ruleLevel} · {rule.mandatory ? "MANDATORY" : "OPTIONAL"}</div><blockquote className="mt-3 border-l-4 border-teal-600 pl-3 text-sm">{rule.sourceExcerpt}</blockquote><p className="mt-2 text-xs text-slate-500">위치: {rule.sourceLocator} · 유효기간: {rule.validFrom ?? "제한 없음"} ~ {rule.validTo ?? "제한 없음"}</p><p className="mt-1 text-xs text-slate-500">AI 추출 신뢰도: {rule.confidence} (가입 확률 아님)</p>{rule.reviewStatus !== "EXPIRED" && rule.reviewStatus !== "REJECTED" ? <div className="mt-4 flex flex-wrap gap-2"><button className="rounded bg-emerald-700 px-3 py-2 text-sm text-white" onClick={() => reviewMutation.mutate({ id: rule.id, body: { action: "APPROVE" } })}>승인</button><button className="rounded bg-blue-700 px-3 py-2 text-sm text-white" onClick={() => approveWithChanges(rule.id, rule.operator, rule.ruleValue, rule.sourceExcerpt)}>값 수정 후 승인</button><button className="rounded bg-amber-600 px-3 py-2 text-sm text-white" onClick={() => reviewMutation.mutate({ id: rule.id, body: { action: "MARK_UNKNOWN" } })}>UNKNOWN</button><button className="rounded bg-slate-700 px-3 py-2 text-sm text-white" onClick={() => reviewMutation.mutate({ id: rule.id, body: { action: "REJECT" } })}>거절</button></div> : null}</article>)}</div></section>
    </main>
  );
}
