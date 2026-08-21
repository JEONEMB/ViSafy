"use client";

import type { FormEvent } from "react";
import type { SourceDocument } from "@/types/data-pipeline";

const input = "ui-input";
export function AdminSourceEditForm({ source, pending, onCancel, onSave }: { source: SourceDocument; pending: boolean; onCancel: () => void; onSave: (body: Record<string, unknown>) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); onSave({ institution: data.get("institution"), sourceType: data.get("sourceType"), title: data.get("title"), sourceUrl: data.get("sourceUrl"), informationBaseDate: data.get("informationBaseDate"), validFrom: data.get("validFrom") || null, validTo: data.get("validTo") || null, language: data.get("language") }); }
  return <form className="mt-4 grid gap-3 rounded-card border border-status-info-border bg-status-info-bg p-4 sm:grid-cols-2" onSubmit={submit}>
    <label className="text-xs font-semibold">기관명<input className={input} defaultValue={source.institution} name="institution" required /></label>
    <label className="text-xs font-semibold">문서 유형<select className={input} defaultValue={source.sourceType} name="sourceType"><option value="PRODUCT_PAGE">상품 페이지</option><option value="PRODUCT_DESCRIPTION">상품설명서</option><option value="TERMS">약관</option><option value="FAQ">FAQ</option><option value="PUBLIC_GUIDE">공공 가이드</option></select></label>
    <label className="text-xs font-semibold sm:col-span-2">문서 제목<input className={input} defaultValue={source.title} name="title" required /></label>
    <label className="text-xs font-semibold sm:col-span-2">공식 URL<input className={input} defaultValue={source.sourceUrl} name="sourceUrl" type="url" required /></label>
    <label className="text-xs font-semibold">정보 기준일<input className={input} defaultValue={source.informationBaseDate} name="informationBaseDate" type="date" required /></label>
    <label className="text-xs font-semibold">유효 시작일<input className={input} defaultValue={source.validFrom ?? ""} name="validFrom" type="date" /></label>
    <label className="text-xs font-semibold">유효 종료일<input className={input} defaultValue={source.validTo ?? ""} name="validTo" type="date" /></label>
    <label className="text-xs font-semibold">언어<select className={input} defaultValue={source.language} name="language"><option value="ko">한국어</option><option value="en">English</option><option value="vi">Tiếng Việt</option></select></label>
    <div className="flex items-end gap-2"><button className="ui-button ui-button-primary" disabled={pending}>{pending ? "저장 중..." : "수정 저장"}</button><button className="ui-button ui-button-secondary" onClick={onCancel} type="button">취소</button></div>
  </form>;
}
