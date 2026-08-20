"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { getSources } from "@/services/data-pipeline";
import { createApplicationStep, createDocumentRequirement } from "@/services/guidance";
import { createProduct, deactivateProduct, getAdminProducts, updateProduct } from "@/services/product";
import { AdminProductEditForm } from "@/components/admin-product-edit-form";
import type { FinancialProduct } from "@/types/product";

const inputClass = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2";
const statusClass = {
  READY: "bg-emerald-100 text-emerald-800",
  PARTIAL: "bg-amber-100 text-amber-800",
  NOT_READY: "bg-slate-200 text-slate-700",
} as const;

export default function ProductAdminPage() {
  const queryClient = useQueryClient();
  const sources = useQuery({ queryKey: ["sources"], queryFn: getSources });
  const products = useQuery({ queryKey: ["admin-products"], queryFn: getAdminProducts });
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<FinancialProduct | null>(null);
  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (product) => {
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setMessage(`${product.productName} 상품을 등록했습니다.`);
    },
    onError: (error: Error) => setMessage(error.message),
  });
  const documentMutation = useMutation({
    mutationFn: ({ productId, body }: { productId: number; body: Record<string, unknown> }) => createDocumentRequirement(productId, body),
    onSuccess: (document) => setMessage(`${document.documentName} 서류 항목을 등록했습니다.`),
    onError: (error: Error) => setMessage(error.message),
  });
  const stepMutation = useMutation({
    mutationFn: ({ productId, body }: { productId: number; body: Record<string, unknown> }) => createApplicationStep(productId, body),
    onSuccess: (step) => setMessage(`STEP ${step.stepOrder} 신청절차를 등록했습니다.`),
    onError: (error: Error) => setMessage(error.message),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) => updateProduct(id, body),
    onSuccess: (product) => { void queryClient.invalidateQueries({ queryKey: ["admin-products"] }); setEditing(null); setMessage(`${product.productName} 상품을 수정했습니다.`); },
    onError: (error: Error) => setMessage(error.message),
  });
  const deactivateMutation = useMutation({
    mutationFn: deactivateProduct,
    onSuccess: (product) => { void queryClient.invalidateQueries({ queryKey: ["admin-products"] }); setMessage(`${product.productName} 상품을 비활성화했습니다.`); },
    onError: (error: Error) => setMessage(error.message),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    mutation.mutate({
      productCode: data.get("productCode"), institution: data.get("institution"),
      productName: data.get("productName"), productType: data.get("productType"),
      financialPurpose: data.get("financialPurpose"), description: data.get("description"),
      targetSummary: data.get("targetSummary"), sourceDocumentId: Number(data.get("sourceDocumentId")),
      active: data.get("active") === "on", foreignerTarget: data.get("foreignerTarget") === "on",
      informationBaseDate: data.get("informationBaseDate"), publicConditions: data.get("publicConditions"),
      additionalConditions: data.get("additionalConditions"), requiredDocuments: data.get("requiredDocuments"),
      applicationMethod: data.get("applicationMethod"),
    });
  }

  function submitDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const type = String(data.get("requirementType"));
    documentMutation.mutate({ productId: Number(data.get("productId")), body: {
      documentName: data.get("documentName"), description: data.get("description") || null,
      requirementType: type, conditionRuleKey: type === "CONDITIONAL" ? data.get("conditionRuleKey") || null : null,
      sourceDocumentId: Number(data.get("sourceDocumentId")), sourceLocator: data.get("sourceLocator"),
      validFrom: data.get("validFrom") || null, validTo: data.get("validTo") || null, active: data.get("active") === "on",
    } });
  }

  function submitStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    stepMutation.mutate({ productId: Number(data.get("productId")), body: {
      stepOrder: Number(data.get("stepOrder")), title: data.get("title"), description: data.get("description"),
      channel: data.get("channel") || null, sourceDocumentId: Number(data.get("sourceDocumentId")),
      sourceLocator: data.get("sourceLocator"), validFrom: data.get("validFrom") || null,
      validTo: data.get("validTo") || null, active: data.get("active") === "on",
    } });
  }

  const approvedSources = sources.data?.filter((source) => source.reviewStatus === "APPROVED") ?? [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-sm font-semibold text-blue-700">FR-201 · FR-501 · FR-601</p>
      <h1 className="mt-2 text-3xl font-bold">금융상품 관리</h1>
      <p className="mt-3 text-slate-600">상품 설명 정보만 등록합니다. 가입 조건은 Source · Rule 검수에서 PRODUCT_RULE로 관리됩니다.</p>
      {message ? <div className="mt-6 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white">{message}</div> : null}

      <form className="mt-8 grid gap-5 rounded-2xl border bg-white p-6 shadow-sm sm:grid-cols-2" onSubmit={submit}>
        <h2 className="sm:col-span-2 text-xl font-bold">새 상품 등록</h2>
        <label className="text-sm font-medium">상품 코드<input className={inputClass} name="productCode" placeholder="예: KB-LOAN-01" required /></label>
        <label className="text-sm font-medium">은행·기관<input className={inputClass} name="institution" placeholder="예: KB국민은행" required /></label>
        <label className="text-sm font-medium">상품명<input className={inputClass} name="productName" required /></label>
        <label className="text-sm font-medium">공식 Source
          <select className={inputClass} name="sourceDocumentId" defaultValue="" required>
            <option value="" disabled>승인된 Source 선택</option>
            {approvedSources.map((source) => <option key={source.id} value={source.id}>{source.institution} · {source.title}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">상품 유형<select className={inputClass} name="productType"><option value="CHECKING_ACCOUNT">입출금 계좌</option><option value="SAVINGS">예·적금</option><option value="LOAN">대출</option><option value="CARD">카드</option><option value="INVESTMENT">투자</option></select></label>
        <label className="text-sm font-medium">금융 목적<select className={inputClass} name="financialPurpose"><option value="ACCOUNT">계좌 개설</option><option value="SAVINGS">저축</option><option value="LOAN">대출</option><option value="CARD">카드 발급</option><option value="INVESTMENT">투자</option></select></label>
        <label className="text-sm font-medium sm:col-span-2">상품 설명<textarea className={`${inputClass} min-h-24`} name="description" required /></label>
        <label className="text-sm font-medium sm:col-span-2">대상 요약<textarea className={inputClass} name="targetSummary" placeholder="예: 국내 거주 외국인 직장인" required /></label>
        <label className="text-sm font-medium">정보 기준일<input className={inputClass} name="informationBaseDate" type="date" required /></label>
        <div className="flex items-end gap-6 pb-2 text-sm"><label className="flex items-center gap-2"><input name="active" type="checkbox" defaultChecked /> 공개</label><label className="flex items-center gap-2"><input name="foreignerTarget" type="checkbox" defaultChecked /> 외국인 대상</label></div>
        <label className="text-sm font-medium sm:col-span-2">공개조건<textarea className={inputClass} name="publicConditions" placeholder="사용자에게 공개할 일반 조건" required /></label>
        <label className="text-sm font-medium sm:col-span-2">추가 확인 조건<textarea className={inputClass} name="additionalConditions" placeholder="지점 또는 은행 확인이 필요한 항목" required /></label>
        <label className="text-sm font-medium sm:col-span-2">필요서류<textarea className={inputClass} name="requiredDocuments" placeholder="줄바꿈으로 구분" required /></label>
        <label className="text-sm font-medium sm:col-span-2">신청방법<textarea className={inputClass} name="applicationMethod" required /></label>
        <button className="w-fit rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-50" disabled={mutation.isPending || approvedSources.length === 0}>{mutation.isPending ? "등록 중..." : "상품 등록"}</button>
        {approvedSources.length === 0 ? <p className="self-center text-sm text-amber-700">먼저 Source를 승인해야 상품을 등록할 수 있습니다.</p> : null}
      </form>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <form className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm" onSubmit={submitDocument}>
          <div><p className="text-sm font-bold text-emerald-700">FR-501 · FR-502</p><h2 className="mt-1 text-xl font-bold">구조화 필요서류 등록</h2><p className="mt-2 text-sm text-slate-500">분류는 Runtime에서 자동 변경되지 않습니다. 조건부 서류만 Rule Key로 개인화됩니다.</p></div>
          <select className={inputClass} name="productId" defaultValue="" required><option value="" disabled>상품 선택</option>{products.data?.map((product) => <option key={product.id} value={product.id}>{product.institution} · {product.productName}</option>)}</select>
          <select className={inputClass} name="sourceDocumentId" defaultValue="" required><option value="" disabled>승인된 공식 Source 선택</option>{approvedSources.map((source) => <option key={source.id} value={source.id}>{source.institution} · {source.title}</option>)}</select>
          <input className={inputClass} name="documentName" placeholder="서류명 (예: 여권)" required />
          <textarea className={inputClass} name="description" placeholder="쉬운 설명 (선택)" />
          <label className="text-sm font-medium">서류 구분<select className={inputClass} name="requirementType" defaultValue="OFFICIAL_REQUIRED"><option value="OFFICIAL_REQUIRED">공식적으로 명시된 필수서류</option><option value="CONDITIONAL">상황에 따라 필요한 서류</option><option value="BANK_CONFIRMATION">은행 확인이 필요한 서류</option></select></label>
          <input className={inputClass} name="conditionRuleKey" placeholder="조건부 Rule Key (예: EMPLOYMENT_TYPE)" />
          <input className={inputClass} name="sourceLocator" placeholder="근거 위치 (예: 상품설명서 p.5)" required />
          <div className="grid grid-cols-2 gap-3"><label className="text-sm">유효 시작일<input className={inputClass} name="validFrom" type="date" /></label><label className="text-sm">유효 종료일<input className={inputClass} name="validTo" type="date" /></label></div>
          <label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" defaultChecked /> 활성</label>
          <button className="rounded-lg bg-emerald-700 px-4 py-2 font-bold text-white disabled:opacity-50" disabled={documentMutation.isPending || !products.data?.length || !approvedSources.length}>{documentMutation.isPending ? "등록 중..." : "서류 항목 등록"}</button>
        </form>

        <form className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm" onSubmit={submitStep}>
          <div><p className="text-sm font-bold text-violet-700">FR-601 · FR-602</p><h2 className="mt-1 text-xl font-bold">공식 신청절차 등록</h2><p className="mt-2 text-sm text-slate-500">공식 링크는 선택한 Source URL을 사용하며 별도 URL을 입력받지 않습니다.</p></div>
          <select className={inputClass} name="productId" defaultValue="" required><option value="" disabled>상품 선택</option>{products.data?.map((product) => <option key={product.id} value={product.id}>{product.institution} · {product.productName}</option>)}</select>
          <select className={inputClass} name="sourceDocumentId" defaultValue="" required><option value="" disabled>승인된 공식 Source 선택</option>{approvedSources.map((source) => <option key={source.id} value={source.id}>{source.institution} · {source.title}</option>)}</select>
          <label className="text-sm font-medium">단계 순서<input className={inputClass} min="1" name="stepOrder" type="number" required /></label>
          <input className={inputClass} name="title" placeholder="단계 제목 (예: 필요서류 확인)" required />
          <textarea className={inputClass} name="description" placeholder="공식 Source에 명시된 절차" required />
          <input className={inputClass} name="channel" placeholder="신청 채널 (예: 영업점, 공식 앱)" />
          <input className={inputClass} name="sourceLocator" placeholder="근거 위치" required />
          <div className="grid grid-cols-2 gap-3"><label className="text-sm">유효 시작일<input className={inputClass} name="validFrom" type="date" /></label><label className="text-sm">유효 종료일<input className={inputClass} name="validTo" type="date" /></label></div>
          <label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" defaultChecked /> 활성</label>
          <button className="rounded-lg bg-violet-700 px-4 py-2 font-bold text-white disabled:opacity-50" disabled={stepMutation.isPending || !products.data?.length || !approvedSources.length}>{stepMutation.isPending ? "등록 중..." : "신청 단계 등록"}</button>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">등록 상품</h2>
        <div className="mt-4 grid gap-4">
          {products.data?.map((product) => (
            <article className="rounded-xl border bg-white p-5" key={product.id}>
              <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm text-slate-500">{product.institution} · {product.productCode}</p><h3 className="text-lg font-bold">{product.productName}</h3></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[product.diagnosisStatus]}`}>{product.diagnosisStatus}</span></div>
              <p className="mt-3 text-sm text-slate-600">승인 PRODUCT_RULE {product.rules.length}개 · 정보 기준일 {product.informationBaseDate} · 최종 수정 {new Date(product.updatedAt).toLocaleString()} · {product.active ? "공개" : "비공개"}</p>
              <p className="mt-2 text-xs font-semibold text-slate-500">판정 근거 상태: {product.diagnosisReasonCode} · 필요한 프로필: {product.requiredFields.join(", ") || "공식 가입조건 Source 필요"}</p>
              <div className="mt-4 flex flex-wrap gap-2"><button className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white" onClick={() => setEditing(product)}>수정</button>{product.active ? <button className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-bold text-white disabled:opacity-50" disabled={deactivateMutation.isPending} onClick={() => { if (window.confirm(`${product.productName}을 비활성화할까요?`)) deactivateMutation.mutate(product.id); }}>비활성화</button> : null}</div>
              {editing?.id === product.id ? <AdminProductEditForm product={editing} sources={approvedSources} pending={updateMutation.isPending} onCancel={() => setEditing(null)} onSave={(body) => updateMutation.mutate({ id: product.id, body })} /> : null}
            </article>
          ))}
          {products.data?.length === 0 ? <p className="rounded-xl border border-dashed p-8 text-center text-slate-500">등록된 상품이 없습니다.</p> : null}
        </div>
      </section>
    </main>
  );
}
