"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { localeOptions } from "@/i18n/config";
import { createProfile, getVisas } from "@/services/profile";
import type { TempProfile } from "@/types/profile";

const inputClass = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2";

export default function ProfilePage() {
  const { locale, setLocale, text } = useLocale();
  const profileText = text.profile;
  const [saved, setSaved] = useState<TempProfile | null>(null);
  const [hasError, setHasError] = useState(false);
  const visas = useQuery({ queryKey: ["visas"], queryFn: getVisas });
  const mutation = useMutation({
    mutationFn: createProfile,
    onSuccess: (profile) => {
      setSaved(profile);
      setHasError(false);
      localStorage.setItem("visafyProfileId", String(profile.id));
    },
    onError: () => setHasError(true),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    mutation.mutate({
      nationality: data.get("nationality"),
      birthDate: data.get("birthDate"),
      visaType: data.get("visaType"),
      visaExpiry: data.get("visaExpiry"),
      residencyStartDate: data.get("residencyStartDate"),
      occupation: data.get("occupation"),
      employmentType: data.get("employmentType"),
      monthlyIncome: Number(data.get("monthlyIncome")),
      employmentDurationMonths: Number(data.get("employmentDurationMonths")),
      financialPurpose: data.get("financialPurpose"),
      language: locale,
      hasBankAccount: data.get("hasBankAccount") === "on",
      housingType: data.get("housingType") || null,
      desiredAmount: data.get("desiredAmount") ? Number(data.get("desiredAmount")) : null,
      preferredBank: data.get("preferredBank") || null,
    });
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div>
        <p className="text-sm font-semibold text-teal-700">{profileText.eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold">{profileText.title}</h1>
        <p className="mt-3 text-slate-600">{profileText.description}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2" aria-label="Language selection">
        {localeOptions.map((option) => (
          <button
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${locale === option.locale ? "border-teal-700 bg-teal-50 text-teal-800" : "border-slate-300 bg-white"}`}
            key={option.locale}
            onClick={() => setLocale(option.locale)}
            type="button"
          >
            <span aria-hidden>{option.flag}</span> {option.language}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">{profileText.privacy}</div>
      {hasError ? <div className="mt-4 rounded-lg bg-rose-100 p-4 text-rose-800">{profileText.saveError}</div> : null}
      {saved ? (
        <div className="mt-4 rounded-xl bg-emerald-100 p-5 text-emerald-900">
          <p className="font-bold">{profileText.saved}</p>
          <p className="mt-2 text-sm">Profile ID: {saved.id} · Session: {saved.sessionId}</p>
          <p className="text-sm">Expires: {new Date(saved.expiresAt).toLocaleString(locale)}</p>
        </div>
      ) : null}

      <form className="mt-8 space-y-8 rounded-xl border bg-white p-6 shadow-sm" onSubmit={submit}>
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-4 text-xl font-bold">{profileText.required}</legend>
          <label className="text-sm font-medium">{profileText.nationality}<input className={inputClass} name="nationality" placeholder={profileText.nationalityExample} required /></label>
          <label className="text-sm font-medium">{profileText.birthDate}<input className={inputClass} name="birthDate" type="date" required /></label>
          <label className="text-sm font-medium">{profileText.visaType}
            <select className={inputClass} name="visaType" required defaultValue="">
              <option value="" disabled>{profileText.chooseVisa}</option>
              {visas.data?.map((visa) => (
                <option key={visa.visaCode} value={visa.visaCode}>
                  {visa.visaCode} · {profileText.visaNames[visa.visaCode as keyof typeof profileText.visaNames]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">{profileText.visaExpiry}<input className={inputClass} name="visaExpiry" type="date" required /></label>
          <label className="text-sm font-medium">{profileText.residencyStartDate}<input className={inputClass} name="residencyStartDate" type="date" required /></label>
          <label className="text-sm font-medium">{profileText.occupation}<input className={inputClass} name="occupation" placeholder={profileText.occupationExample} required /></label>
          <label className="text-sm font-medium">{profileText.employmentType}
            <select className={inputClass} name="employmentType">
              <option value="REGULAR">{profileText.employment.regular}</option>
              <option value="CONTRACT">{profileText.employment.contract}</option>
              <option value="PART_TIME">{profileText.employment.partTime}</option>
              <option value="SELF_EMPLOYED">{profileText.employment.selfEmployed}</option>
              <option value="STUDENT">{profileText.employment.student}</option>
            </select>
          </label>
          <label className="text-sm font-medium">{profileText.monthlyIncome}<input className={inputClass} min="0" name="monthlyIncome" type="number" required /></label>
          <label className="text-sm font-medium">{profileText.employmentDuration}<input className={inputClass} min="0" name="employmentDurationMonths" type="number" required /></label>
          <label className="text-sm font-medium">{profileText.financialPurpose}
            <select className={inputClass} name="financialPurpose">
              <option value="ACCOUNT">{profileText.purpose.account}</option>
              <option value="SAVINGS">{profileText.purpose.savings}</option>
              <option value="LOAN">{profileText.purpose.loan}</option>
              <option value="CARD">{profileText.purpose.card}</option>
            </select>
          </label>
        </fieldset>

        <details className="rounded-lg border p-4">
          <summary className="cursor-pointer text-lg font-bold">{profileText.optional}</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm"><input name="hasBankAccount" type="checkbox" /> {profileText.hasBankAccount}</label>
            <label className="text-sm font-medium">{profileText.housingType}<input className={inputClass} name="housingType" placeholder={profileText.housingExample} /></label>
            <label className="text-sm font-medium">{profileText.desiredAmount}<input className={inputClass} min="0" name="desiredAmount" type="number" /></label>
            <label className="text-sm font-medium">{profileText.preferredBank}<input className={inputClass} name="preferredBank" /></label>
          </div>
        </details>
        <button className="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white disabled:opacity-50" disabled={mutation.isPending || visas.isLoading}>
          {mutation.isPending ? profileText.submitting : profileText.submit}
        </button>
      </form>
    </main>
  );
}
