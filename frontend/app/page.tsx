"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/components/providers/locale-provider";
import { localeOptions, type Locale } from "@/i18n/config";

export default function HomePage() {
  const router = useRouter();
  const { locale, setLocale, text } = useLocale();

  function chooseLanguage(nextLocale: Locale) {
    setLocale(nextLocale);
    router.push("/profile");
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-69px)] max-w-5xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">{text.landing.eyebrow}</p>
      <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">{text.landing.title}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{text.landing.description}</p>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">{text.landing.choose}</h2>
        <p className="mt-2 text-slate-600">{text.landing.hint}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {localeOptions.map((option) => (
            <button
              className={`rounded-2xl border bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-teal-500 hover:shadow-md ${locale === option.locale ? "border-teal-600 ring-2 ring-teal-100" : "border-slate-200"}`}
              key={option.locale}
              onClick={() => chooseLanguage(option.locale)}
              type="button"
            >
              <span aria-hidden className="text-5xl">{option.flag}</span>
              <span className="mt-5 block text-xl font-bold">{option.country}</span>
              <span className="mt-1 block text-sm text-slate-500">{option.language}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
