"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import type { Locale } from "@/i18n/config";
import { financialPurposeLabel, landingFinancialPurposes, type FinancialPurposeCode } from "@/lib/financial-purposes";

const languages: Array<{ locale: Locale; name: string; flag: string }> = [
  { locale: "ko", name: "한국어", flag: "/flags/kr.png" },
  { locale: "en", name: "English", flag: "/flags/us.svg" },
  { locale: "vi", name: "Tiếng Việt", flag: "/flags/vn.svg" },
];
const copy = {
  ko: { eyebrow: "공식 금융정보 기반 외국인 금융 정착 Agent", title: <>한국에서 처음 시작하는 금융생활,<br /><span className="text-brand">무엇부터 해야 할지 ViSafy가 알려드립니다.</span></>, description: "계좌 · 적금 · 송금 · 대출까지 내 조건으로 이용할 수 있는 금융서비스와 필요한 준비를 공식 정보로 확인하세요.", language: "사용할 언어를 선택하세요", purpose: "한국에서 지금 가장 필요한 금융서비스는 무엇인가요?", skip: "무엇부터 해야 할지 모르겠어요", cta: "내 금융생활 시작하기" },
  en: { eyebrow: "Financial settlement agent based on official information", title: <>Starting your financial life in Korea?<br /><span className="text-brand">ViSafy shows you what to prepare first.</span></>, description: "From accounts and savings to remittance and loans, check which services fit your situation and what you need to prepare.", language: "Choose your display language", purpose: "What financial service do you need most in Korea?", skip: "I do not know where to start", cta: "Start my financial life" },
  vi: { eyebrow: "Trợ lý ổn định tài chính dựa trên thông tin chính thức", title: <>Bắt đầu cuộc sống tài chính tại Hàn Quốc?<br /><span className="text-brand">ViSafy cho bạn biết cần chuẩn bị gì trước.</span></>, description: "Từ tài khoản, tiết kiệm, chuyển tiền đến khoản vay, hãy kiểm tra dịch vụ phù hợp và những gì cần chuẩn bị.", language: "Chọn ngôn ngữ hiển thị", purpose: "Bạn cần dịch vụ tài chính nào nhất tại Hàn Quốc?", skip: "Tôi chưa biết bắt đầu từ đâu", cta: "Bắt đầu cuộc sống tài chính" },
} as const;

export default function HomePage() {
  const router = useRouter(); const { locale, setLocale } = useLocale(); const text = copy[locale];
  const [confirmed, setConfirmed] = useState(false); const [purpose, setPurpose] = useState<FinancialPurposeCode | null>(null);
  useEffect(() => { const saved = localStorage.getItem("visafyLocale"); setConfirmed(saved === "ko" || saved === "en" || saved === "vi"); setPurpose(localStorage.getItem("visafyFinancialPurpose") as FinancialPurposeCode | null); }, []);
  function choosePurpose(value: FinancialPurposeCode) { setPurpose(value); localStorage.setItem("visafyFinancialPurpose", value); }
  return <main className="min-h-screen bg-canvas text-ink"><div className="mx-auto w-full max-w-page px-5 py-6 sm:px-8"><header className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-control bg-ink text-lg font-bold text-white">V</span><span className="text-xl font-bold">ViSafy</span></header>
    <section className="py-14 text-center sm:py-20"><p className="ui-eyebrow">{text.eyebrow}</p><h1 className="mx-auto mt-4 max-w-5xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{text.title}</h1><p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">{text.description}</p>
      <h2 className="mt-12 text-lg font-bold">STEP 1 · {text.language}</h2><div className="mx-auto mt-5 grid max-w-3xl gap-4 sm:grid-cols-3">{languages.map((option) => <button aria-label={`${option.name} 선택`} aria-pressed={confirmed && locale === option.locale} className={`rounded-card border bg-surface p-6 transition ${confirmed && locale === option.locale ? "border-brand bg-brand-soft ring-2 ring-brand/10" : "border-line hover:border-line-strong"}`} key={option.locale} onClick={() => { setLocale(option.locale); setConfirmed(true); }} type="button"><span className="relative mx-auto block h-20 w-20 overflow-hidden rounded-full border border-line"><Image alt="" className="object-cover" fill sizes="80px" src={option.flag} /></span><span className="mt-4 block font-bold">{option.name}</span></button>)}</div>
      {confirmed ? <><h2 className="mt-12 text-lg font-bold">STEP 2 · {text.purpose}</h2><div className="mx-auto mt-5 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">{landingFinancialPurposes.map((value, index) => <button aria-pressed={purpose === value} className={`min-h-16 rounded-card border px-4 text-left text-sm font-semibold ${purpose === value ? "border-brand bg-brand-soft text-brand" : "border-line bg-surface"}`} key={`${value}-${index}`} onClick={() => choosePurpose(value)} type="button">{index === landingFinancialPurposes.length - 1 ? text.skip : financialPurposeLabel(locale, value)}</button>)}</div><button className="ui-button ui-button-primary mt-9 min-h-12 px-7" disabled={!purpose} onClick={() => { if (purpose) router.push("/profile"); }} type="button">{text.cta} →</button></> : null}
    </section></div></main>;
}
