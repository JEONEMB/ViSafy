"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { createProfile, getVisas } from "@/services/profile";
import type { TempProfile } from "@/types/profile";

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2";
const copy = {
  ko: { title: "임시 금융 프로필", description: "사전자격 진단에 필요한 최소 정보만 입력합니다.", submit: "프로필 저장", saved: "프로필이 저장되었습니다." },
  en: { title: "Temporary financial profile", description: "Enter only the minimum information needed for a pre-check.", submit: "Save profile", saved: "Your profile has been saved." },
};

export default function ProfilePage() {
  const [language, setLanguage] = useState<"ko" | "en">("ko");
  const [saved, setSaved] = useState<TempProfile | null>(null);
  const [error, setError] = useState("");
  const visas = useQuery({ queryKey: ["visas"], queryFn: getVisas });
  const mutation = useMutation({
    mutationFn: createProfile,
    onSuccess: (profile) => { setSaved(profile); setError(""); localStorage.setItem("visafyProfileId", String(profile.id)); },
    onError: (reason: Error) => setError(reason.message),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    mutation.mutate({
      nationality: data.get("nationality"), birthDate: data.get("birthDate"), visaType: data.get("visaType"),
      visaExpiry: data.get("visaExpiry"), residencyStartDate: data.get("residencyStartDate"),
      occupation: data.get("occupation"), employmentType: data.get("employmentType"),
      monthlyIncome: Number(data.get("monthlyIncome")), employmentDurationMonths: Number(data.get("employmentDurationMonths")),
      financialPurpose: data.get("financialPurpose"), language,
      hasBankAccount: data.get("hasBankAccount") === "on", housingType: data.get("housingType") || null,
      desiredAmount: data.get("desiredAmount") ? Number(data.get("desiredAmount")) : null,
      preferredBank: data.get("preferredBank") || null,
    });
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-sm font-semibold text-teal-700">FR-101 ~ FR-103</p><h1 className="mt-2 text-3xl font-bold">{copy[language].title}</h1><p className="mt-3 text-slate-600">{copy[language].description}</p></div>
        <select className="rounded-lg border bg-white px-3 py-2" value={language} onChange={(event) => setLanguage(event.target.value as "ko" | "en")}><option value="ko">한국어</option><option value="en">English</option></select>
      </div>

      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">주민등록번호, 여권번호, 외국인등록번호는 입력하지 마세요. 이 임시 프로필은 24시간 후 만료됩니다.</div>
      {error ? <div className="mt-4 rounded-lg bg-rose-100 p-4 text-rose-800">{error}</div> : null}
      {saved ? <div className="mt-4 rounded-xl bg-emerald-100 p-5 text-emerald-900"><p className="font-bold">{copy[language].saved}</p><p className="mt-2 text-sm">Profile ID: {saved.id} · Session: {saved.sessionId}</p><p className="text-sm">Expires: {new Date(saved.expiresAt).toLocaleString()}</p></div> : null}

      <form className="mt-8 space-y-8 rounded-xl border bg-white p-6 shadow-sm" onSubmit={submit}>
        <fieldset className="grid gap-4 sm:grid-cols-2"><legend className="mb-4 text-xl font-bold">P0 필수 정보</legend>
          <label className="text-sm font-medium">국적<input className={inputClass} name="nationality" placeholder="예: 베트남" required /></label>
          <label className="text-sm font-medium">생년월일<input className={inputClass} name="birthDate" type="date" required /></label>
          <label className="text-sm font-medium">비자 종류<select className={inputClass} name="visaType" required defaultValue=""><option value="" disabled>선택하세요</option>{visas.data?.map((visa) => <option key={visa.visaCode} value={visa.visaCode}>{visa.visaCode} · {visa.visaName}</option>)}</select></label>
          <label className="text-sm font-medium">비자 만료일<input className={inputClass} name="visaExpiry" type="date" required /></label>
          <label className="text-sm font-medium">한국 체류 시작일<input className={inputClass} name="residencyStartDate" type="date" required /></label>
          <label className="text-sm font-medium">직업<input className={inputClass} name="occupation" placeholder="예: 소프트웨어 개발자" required /></label>
          <label className="text-sm font-medium">고용형태<select className={inputClass} name="employmentType"><option value="REGULAR">정규직</option><option value="CONTRACT">계약직</option><option value="PART_TIME">시간제</option><option value="SELF_EMPLOYED">자영업</option><option value="STUDENT">학생</option></select></label>
          <label className="text-sm font-medium">월 소득 (원)<input className={inputClass} min="0" name="monthlyIncome" type="number" required /></label>
          <label className="text-sm font-medium">근속기간 (개월)<input className={inputClass} min="0" name="employmentDurationMonths" type="number" required /></label>
          <label className="text-sm font-medium">금융 목적<select className={inputClass} name="financialPurpose"><option value="ACCOUNT">입출금 계좌</option><option value="SAVINGS">예·적금</option><option value="LOAN">대출</option><option value="CARD">카드</option></select></label>
        </fieldset>

        <details className="rounded-lg border p-4"><summary className="cursor-pointer text-lg font-bold">P1 선택 정보</summary><div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm"><input name="hasBankAccount" type="checkbox" /> 한국 은행계좌 보유</label>
          <label className="text-sm font-medium">주거 형태<input className={inputClass} name="housingType" placeholder="예: 월세" /></label>
          <label className="text-sm font-medium">희망 금액 (원)<input className={inputClass} min="0" name="desiredAmount" type="number" /></label>
          <label className="text-sm font-medium">선호 은행<input className={inputClass} name="preferredBank" /></label>
        </div></details>
        <button className="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white disabled:opacity-50" disabled={mutation.isPending || visas.isLoading}>{mutation.isPending ? "저장 중..." : copy[language].submit}</button>
      </form>
    </main>
  );
}
