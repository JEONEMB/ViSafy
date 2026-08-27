"use client";

import type { FormEvent } from "react";
import type { FinancialProduct } from "@/types/product";
import type { SourceDocument } from "@/types/data-pipeline";

const input = "ui-input";

export function AdminProductEditForm({ product, sources, pending, onCancel, onSave }: {
  product: FinancialProduct; sources: SourceDocument[]; pending: boolean;
  onCancel: () => void; onSave: (body: Record<string, unknown>) => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    onSave({ institution: data.get("institution"), productName: data.get("productName"), productType: data.get("productType"), financialPurpose: data.get("financialPurpose"), description: data.get("description"), targetSummary: data.get("targetSummary"), sourceDocumentId: Number(data.get("sourceDocumentId")), active: data.get("active") === "on", foreignerTarget: data.get("foreignerTarget") === "on", informationBaseDate: data.get("informationBaseDate"), publicConditions: data.get("publicConditions"), additionalConditions: data.get("additionalConditions"), requiredDocuments: data.get("requiredDocuments"), applicationMethod: data.get("applicationMethod"), officialApplicationUrl: data.get("officialApplicationUrl") || null });
  }
  return <form className="mt-5 grid gap-4 rounded-card border border-status-info-border bg-status-info-bg p-5 sm:grid-cols-2" onSubmit={submit}>
    <label className="text-sm">기관명<input className={input} defaultValue={product.institution} name="institution" required /></label>
    <label className="text-sm">상품명<input className={input} defaultValue={product.productName} name="productName" required /></label>
    <label className="text-sm">상품 유형<select className={input} defaultValue={product.productType} name="productType"><option value="CHECKING_ACCOUNT">입출금 계좌</option><option value="SAVINGS">예·적금</option><option value="LOAN">대출</option><option value="CARD">카드</option><option value="INVESTMENT">투자</option></select></label>
    <label className="text-sm">금융 목적<select className={input} defaultValue={product.financialPurpose} name="financialPurpose"><option value="ACCOUNT">계좌</option><option value="SAVINGS">예·적금</option><option value="LOAN">대출</option><option value="CARD">카드</option><option value="INVESTMENT">투자</option></select></label>
    <label className="text-sm sm:col-span-2">공식 Source<select className={input} defaultValue={product.sourceDocumentId} name="sourceDocumentId">{sources.map((source) => <option key={source.id} value={source.id}>{source.institution} · {source.title}</option>)}</select></label>
    <label className="text-sm sm:col-span-2">설명<textarea className={input} defaultValue={product.description} name="description" required /></label>
    <label className="text-sm sm:col-span-2">대상 요약<textarea className={input} defaultValue={product.targetSummary} name="targetSummary" required /></label>
    <label className="text-sm">정보 기준일<input className={input} defaultValue={product.informationBaseDate} name="informationBaseDate" type="date" required /></label>
    <div className="flex items-end gap-5 pb-2"><label className="text-sm"><input defaultChecked={product.active} name="active" type="checkbox" /> 공개</label><label className="text-sm"><input defaultChecked={product.foreignerTarget} name="foreignerTarget" type="checkbox" /> 외국인 대상</label></div>
    <label className="text-sm sm:col-span-2">공개조건<textarea className={input} defaultValue={product.publicConditions} name="publicConditions" required /></label>
    <label className="text-sm sm:col-span-2">추가 확인조건<textarea className={input} defaultValue={product.additionalConditions} name="additionalConditions" required /></label>
    <label className="text-sm sm:col-span-2">기존 서류 안내<textarea className={input} defaultValue={product.requiredDocuments} name="requiredDocuments" required /></label>
    <label className="text-sm sm:col-span-2">기존 신청방법<textarea className={input} defaultValue={product.applicationMethod} name="applicationMethod" required /></label>
    <label className="text-sm sm:col-span-2">공식 신청 URL<input className={input} defaultValue={product.officialApplicationUrl ?? ""} name="officialApplicationUrl" placeholder="https://..." type="url" /></label>
    <div className="flex gap-2 sm:col-span-2"><button className="ui-button ui-button-primary" disabled={pending}>{pending ? "저장 중..." : "수정 저장"}</button><button className="ui-button ui-button-secondary" onClick={onCancel} type="button">취소</button></div>
  </form>;
}
