"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { getSources } from "@/services/data-pipeline";
import { createProduct, getAdminProducts } from "@/services/product";

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
  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (product) => {
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setMessage(`${product.productName} 상품을 등록했습니다.`);
    },
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

  const approvedSources = sources.data?.filter((source) => source.reviewStatus === "APPROVED") ?? [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-sm font-semibold text-blue-700">FR-201</p>
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
        <label className="text-sm font-medium">상품 유형<select className={inputClass} name="productType"><option value="CHECKING_ACCOUNT">입출금 계좌</option><option value="SAVINGS">예·적금</option><option value="LOAN">대출</option><option value="CARD">카드</option></select></label>
        <label className="text-sm font-medium">금융 목적<select className={inputClass} name="financialPurpose"><option value="ACCOUNT">계좌 개설</option><option value="SAVINGS">저축</option><option value="LOAN">대출</option><option value="CARD">카드 발급</option></select></label>
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

      <section className="mt-12">
        <h2 className="text-2xl font-bold">등록 상품</h2>
        <div className="mt-4 grid gap-4">
          {products.data?.map((product) => (
            <article className="rounded-xl border bg-white p-5" key={product.id}>
              <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm text-slate-500">{product.institution} · {product.productCode}</p><h3 className="text-lg font-bold">{product.productName}</h3></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[product.diagnosisStatus]}`}>{product.diagnosisStatus}</span></div>
              <p className="mt-3 text-sm text-slate-600">승인 PRODUCT_RULE {product.rules.length}개 · 정보 기준일 {product.informationBaseDate} · {product.active ? "공개" : "비공개"}</p>
            </article>
          ))}
          {products.data?.length === 0 ? <p className="rounded-xl border border-dashed p-8 text-center text-slate-500">등록된 상품이 없습니다.</p> : null}
        </div>
      </section>
    </main>
  );
}
