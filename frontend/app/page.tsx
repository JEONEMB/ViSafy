"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { useLocale } from "@/components/providers/locale-provider";
import type { Locale } from "@/i18n/config";

const countryOptions: Array<{
  locale: Locale;
  nationality: string;
  name: string;
  language: string;
  flag: string;
  accent: string;
}> = [
  {
    locale: "ko",
    nationality: "KR",
    name: "대한민국",
    language: "한국어",
    flag: "/flags/kr.png",
    accent: "group-hover:border-blue-200 group-hover:bg-blue-50/50",
  },
  {
    locale: "en",
    nationality: "US",
    name: "United States",
    language: "English",
    flag: "/flags/us.svg",
    accent: "group-hover:border-indigo-200 group-hover:bg-indigo-50/50",
  },
  {
    locale: "vi",
    nationality: "VN",
    name: "Việt Nam",
    language: "Tiếng Việt",
    flag: "/flags/vn.svg",
    accent: "group-hover:border-amber-200 group-hover:bg-amber-50/50",
  },
];

const heroCopy = {
  ko: {
    eyebrow: "공식 금융정보 기반 외국인 금융자격 사전진단",
    title: <>한국 금융,<br />번역보다 중요한 것은<br /><span className="text-blue-700">‘내 조건으로 어디까지 가능한가’</span>입니다.</>,
    description: "검수된 공식 자료와 내 체류·소득 조건을 비교해, 가능한 범위와 은행에 추가로 확인할 내용을 나누어 보여드립니다.",
    cta: "내 조건 확인하기",
    choose: "사용할 언어와 국적을 선택하세요",
    footnote: "주민등록번호·여권번호·외국인등록번호 없이 시작할 수 있습니다.",
  },
  en: {
    eyebrow: "Preliminary financial eligibility check for foreigners, based on official information",
    title: <>Korean finance is not just about translation.<br /><span className="text-blue-700">It is about what is possible for your situation.</span></>,
    description: "We compare reviewed official information with your stay and income details, separating public conditions from items that still require bank confirmation.",
    cta: "Check my situation",
    choose: "Choose your language and nationality",
    footnote: "Start without entering a resident, passport, or alien registration number.",
  },
  vi: {
    eyebrow: "Kiểm tra sơ bộ điều kiện tài chính cho người nước ngoài dựa trên thông tin chính thức",
    title: <>Tài chính Hàn Quốc không chỉ là vấn đề dịch thuật.<br /><span className="text-blue-700">Điều quan trọng là điều gì phù hợp với điều kiện của bạn.</span></>,
    description: "Chúng tôi so sánh thông tin chính thức đã kiểm duyệt với điều kiện cư trú và thu nhập, đồng thời tách rõ nội dung cần ngân hàng xác nhận.",
    cta: "Kiểm tra điều kiện của tôi",
    choose: "Chọn ngôn ngữ và quốc tịch",
    footnote: "Có thể bắt đầu mà không cần nhập số hộ chiếu hoặc số đăng ký người nước ngoài.",
  },
} as const;

export default function HomePage() {
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const copy = heroCopy[locale];

  const selectCountry = (country: (typeof countryOptions)[number]) => {
    setLocale(country.locale);
    localStorage.setItem("visafyNationality", country.nationality);
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

        <section className="flex flex-1 flex-col justify-center py-12 sm:py-16">
          <div className="mx-auto w-full max-w-5xl">
            <div className="mx-auto max-w-4xl text-center">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-blue-600 sm:text-sm sm:tracking-[0.18em]">
                {copy.eyebrow}
              </p>
              <h1 className="text-[2.35rem] font-bold leading-[1.12] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[3.5rem]">
                {copy.title}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
                {copy.description}
              </p>
              <p className="mt-7 inline-flex rounded-full bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-700/20">{copy.cta} ↓</p>
            </div>

            <p className="mt-10 text-center text-sm font-bold text-slate-700">{copy.choose}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3 md:gap-5">
              {countryOptions.map((country) => (
                <button
                  key={country.locale}
                  type="button"
                  onClick={() => selectCountry(country)}
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
                      className={`object-cover transition duration-300 ${
                        country.locale === "ko"
                          ? "scale-[1.14] group-hover:scale-[1.18]"
                          : "group-hover:scale-105"
                      }`}
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

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">{copy.footnote}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
