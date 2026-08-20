"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useLocale } from "@/components/providers/locale-provider";
import type { Locale } from "@/i18n/config";

const languageOptions: Array<{
  locale: Locale;
  name: string;
  description: string;
  flag: string;
}> = [
  {
    locale: "ko",
    name: "한국어",
    description: "표시 언어",
    flag: "/flags/kr.png",
  },
  {
    locale: "en",
    name: "English",
    description: "Display language",
    flag: "/flags/us.svg",
  },
  {
    locale: "vi",
    name: "Tiếng Việt",
    description: "Ngôn ngữ hiển thị",
    flag: "/flags/vn.svg",
  },
];

const heroCopy = {
  ko: {
    eyebrow: "공식 금융정보 기반 외국인 금융자격 사전진단",
    title: <>한국 금융,<br />번역보다 중요한 것은<br /><span className="text-blue-700">‘내 조건으로 어디까지 가능한가’</span>입니다.</>,
    description: "검수된 공식 자료와 내 체류·소득 조건을 비교해, 가능한 범위와 은행에 추가로 확인할 내용을 나누어 보여드립니다.",
    cta: "내 조건 확인하기",
    choose: "먼저 사용할 언어를 선택하세요",
    footnote: "주민등록번호·여권번호·외국인등록번호 없이 시작할 수 있습니다.",
  },
  en: {
    eyebrow: "Preliminary financial eligibility check for foreigners, based on official information",
    title: <>Korean finance is not just about translation.<br /><span className="text-blue-700">It is about what is possible for your situation.</span></>,
    description: "We compare reviewed official information with your stay and income details, separating public conditions from items that still require bank confirmation.",
    cta: "Check my situation",
    choose: "Choose your display language first",
    footnote: "Start without entering a resident, passport, or alien registration number.",
  },
  vi: {
    eyebrow: "Kiểm tra sơ bộ điều kiện tài chính cho người nước ngoài dựa trên thông tin chính thức",
    title: <>Tài chính Hàn Quốc không chỉ là vấn đề dịch thuật.<br /><span className="text-blue-700">Điều quan trọng là điều gì phù hợp với điều kiện của bạn.</span></>,
    description: "Chúng tôi so sánh thông tin chính thức đã kiểm duyệt với điều kiện cư trú và thu nhập, đồng thời tách rõ nội dung cần ngân hàng xác nhận.",
    cta: "Kiểm tra điều kiện của tôi",
    choose: "Trước tiên, hãy chọn ngôn ngữ hiển thị",
    footnote: "Có thể bắt đầu mà không cần nhập số hộ chiếu hoặc số đăng ký người nước ngoài.",
  },
} as const;

export default function HomePage() {
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const [languageConfirmed, setLanguageConfirmed] = useState(false);
  const copy = heroCopy[locale];

  useEffect(() => {
    const savedLocale = localStorage.getItem("visafyLocale");
    setLanguageConfirmed(savedLocale === "ko" || savedLocale === "en" || savedLocale === "vi");
  }, []);

  const selectLanguage = (option: (typeof languageOptions)[number]) => {
    setLocale(option.locale);
    setLanguageConfirmed(true);
  };

  const startProfile = () => {
    if (!languageConfirmed) {
      return;
    }

    router.push("/profile");
  };

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-page flex-col px-5 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-control bg-ink text-lg font-bold text-white">
              V
            </span>
            <span className="text-xl font-bold tracking-tight">ViSafy</span>
          </div>
        </header>

        <section className="flex flex-1 flex-col justify-center py-12 sm:py-16">
          <div className="mx-auto w-full max-w-5xl">
            <div className="mx-auto max-w-reading text-center">
              <p className="mb-4 text-sm font-semibold text-brand">
                {copy.eyebrow}
              </p>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
                {copy.title}
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
                {copy.description}
              </p>
              <button
                type="button"
                onClick={startProfile}
                disabled={!languageConfirmed}
                className="ui-button ui-button-primary mt-7 min-h-12 px-6"
              >
                {copy.cta} ↓
              </button>
            </div>

            <p className="mt-12 text-center text-sm font-semibold text-ink">{copy.choose}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3 md:gap-5">
              {languageOptions.map((option) => {
                const isSelected = languageConfirmed && locale === option.locale;

                return (
                  <button
                    key={option.locale}
                    type="button"
                    onClick={() => selectLanguage(option)}
                    aria-label={`${option.name} 선택`}
                    aria-pressed={isSelected}
                    className={`group relative flex min-h-60 flex-col items-center justify-center rounded-card border bg-surface px-6 py-8 text-center shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-line-strong ${
                      isSelected
                        ? "border-brand bg-brand-soft ring-2 ring-brand/15"
                        : "border-line"
                    }`}
                  >
                  <span className="relative block h-24 w-24 overflow-hidden rounded-full border border-line bg-surface sm:h-28 sm:w-28">
                    <Image
                      src={option.flag}
                      alt=""
                      fill
                      priority
                      sizes="112px"
                      className={`object-cover transition duration-200 ${
                        option.locale === "ko"
                          ? "scale-110"
                          : ""
                      }`}
                    />
                  </span>

                  <span className="mt-6 text-xl font-bold text-ink">
                    {option.name}
                  </span>
                  <span className="mt-1 text-sm font-medium text-muted">
                    {option.description}
                  </span>

                    <span
                      className={`absolute bottom-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border transition duration-200 ${
                        isSelected
                          ? "border-brand bg-brand text-white opacity-100"
                          : "border-line bg-surface-subtle text-muted opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {isSelected ? (
                        <span aria-hidden="true">✓</span>
                      ) : (
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                          <path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-8 text-center text-xs leading-5 text-quiet">{copy.footnote}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
