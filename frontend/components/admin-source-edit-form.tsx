"use client";

import type { FormEvent } from "react";
import type { SourceDocument } from "@/types/data-pipeline";

const input = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2";
export function AdminSourceEditForm({ source, pending, onCancel, onSave }: { source: SourceDocument; pending: boolean; onCancel: () => void; onSave: (body: Record<string, unknown>) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); onSave({ institution: data.get("institution"), sourceType: data.get("sourceType"), title: data.get("title"), sourceUrl: data.get("sourceUrl"), validFrom: data.get("validFrom") || null, validTo: data.get("validTo") || null, language: data.get("language") }); }
  return <form className="mt-4 grid gap-3 rounded-xl border border-teal-200 bg-teal-50/50 p-4 sm:grid-cols-2" onSubmit={submit}>
    <label className="text-xs font-semibold">기관명<input className={input} defaultValue={source.institution} name="institution" required /></label>
    <label className="text-xs font-semibold">문서 유형<select className={input} defaultValue={source.sourceType} name="sourceType"><option value="PRODUCT_PAGE">상품 페이지</option><option value="PRODUCT_DESCRIPTION">상품설명서</option><option value="TERMS">약관</option><option value="FAQ">FAQ</option><option value="PUBLIC_GUIDE">공공 가이드</option></select></label>
    <label className="text-xs font-semibold sm:col-span-2">문서 제목<input className={input} defaultValue={source.title} name="title" required /></label>
    <label className="text-xs font-semibold sm:col-span-2">공식 URL<input className={input} defaultValue={source.sourceUrl} name="sourceUrl" type="url" required /></label>
    <label className="text-xs font-semibold">유효 시작일<input className={input} defaultValue={source.validFrom ?? ""} name="validFrom" type="date" /></label>
    <label className="text-xs font-semibold">유효 종료일<input className={input} defaultValue={source.validTo ?? ""} name="validTo" type="date" /></label>
    <label className="text-xs font-semibold">언어<select className={input} defaultValue={source.language} name="language"><option value="ko">한국어</option><option value="en">English</option><option value="vi">Tiếng Việt</option></select></label>
    <div className="flex items-end gap-2"><button className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-bold text-white disabled:opacity-50" disabled={pending}>{pending ? "저장 중..." : "수정 저장"}</button><button className="rounded-lg border bg-white px-3 py-2 text-sm font-bold" onClick={onCancel} type="button">취소</button></div>
  </form>;
}
