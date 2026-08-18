"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { useLocale } from "@/components/providers/locale-provider";
import type { Locale } from "@/i18n/config";

const countryOptions: Array<{
  locale: Locale;
  name: string;
  language: string;
  flag: string;
  accent: string;
}> = [
  {
    locale: "ko",
    name: "대한민국",
    language: "한국어",
    flag: "/flags/kr.svg",
    accent: "group-hover:border-blue-200 group-hover:bg-blue-50/50",
  },
  {
    locale: "en",
    name: "United States",
    language: "English",
    flag: "/flags/us.svg",
    accent: "group-hover:border-indigo-200 group-hover:bg-indigo-50/50",
  },
  {
    locale: "vi",
    name: "Việt Nam",
    language: "Tiếng Việt",
    flag: "/flags/vn.svg",
    accent: "group-hover:border-amber-200 group-hover:bg-amber-50/50",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { setLocale } = useLocale();

  const selectCountry = (locale: Locale) => {
    setLocale(locale);
    router.push("/profile");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f7fb] text-slate-950">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[440px] w-[440px] rounded-full bg-blue-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -right-32 h-[520px] w-[520px] rounded-full bg-indigo-200/30 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-lg font-bold text-white shadow-lg shadow-slate-950/15">
              V
            </span>
            <span className="text-xl font-bold tracking-[-0.03em]">ViSafy</span>
          </div>
          <span className="hidden rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-xs font-semibold tracking-wide text-slate-500 shadow-sm backdrop-blur sm:inline-flex">
            LANGUAGE · 언어 · NGÔN NGỮ
          </span>
        </header>

        <section className="flex flex-1 flex-col justify-center py-16 sm:py-20">
          <div className="mx-auto w-full max-w-5xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-blue-600 sm:text-sm sm:tracking-[0.18em]">
                Visa-aware financial guide
              </p>
              <h1 className="text-[2.5rem] font-bold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
                Start in your language
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
                Choose a language to build your financial profile and receive guidance you can understand.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5 lg:mt-14">
              {countryOptions.map((country) => (
                <button
                  key={country.locale}
                  type="button"
                  onClick={() => selectCountry(country.locale)}
                  aria-label={`${country.language} 선택`}
                  className={`group relative flex min-h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white/90 px-6 py-8 text-center shadow-[0_12px_36px_rgba(15,23,42,0.06)] backdrop-blur transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_44px_rgba(15,23,42,0.11)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-blue-500 ${country.accent}`}
                >
                  <span className="relative block h-24 w-24 overflow-hidden rounded-full border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.12)] sm:h-28 sm:w-28">
                    <Image
                      src={country.flag}
                      alt=""
                      fill
                      priority
                      sizes="112px"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </span>

                  <span className="mt-7 text-2xl font-bold tracking-[-0.025em] text-slate-950">
                    {country.name}
                  </span>
                  <span className="mt-1.5 text-sm font-medium text-slate-500">
                    {country.language}
                  </span>

                  <span className="absolute bottom-6 right-6 flex h-8 w-8 translate-x-1 items-center justify-center rounded-full bg-slate-100 text-slate-500 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:bg-slate-950 group-hover:text-white group-hover:opacity-100">
                    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                      <path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              You can change your language anytime. No identification number is required to get started.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
