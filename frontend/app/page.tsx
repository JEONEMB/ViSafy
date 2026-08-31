"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { localeOptions, type Locale } from "@/i18n/config";
import { financialPurposeLabel, landingFinancialPurposes, type FinancialPurposeCode } from "@/lib/financial-purposes";

const flagImages: Record<Locale, string> = {
  ko: "/flags/kr.png", en: "/flags/us.svg", vi: "/flags/vn.svg",
  zh: "/flags/cn.svg", ja: "/flags/jp.svg", th: "/flags/th.svg",
};

const copy = {
  ko: { eyebrow: "공식 금융정보 기반 외국인 금융 정착 Agent", title: "한국에서 처음 시작하는 금융생활,", highlight: "무엇부터 해야 할지 SSAFIN이 알려드립니다.", description: "계좌 · 적금 · 송금 · 대출까지 내 조건으로 이용할 수 있는 금융서비스와 필요한 준비를 공식 정보로 확인하세요.", purpose: "한국에서 지금 가장 필요한 금융서비스는 무엇인가요?", skip: "무엇부터 해야 할지 모르겠어요", cta: "내 금융생활 시작하기" },
  en: { eyebrow: "Financial settlement agent based on official information", title: "Starting your financial life in Korea?", highlight: "SSAFIN shows you what to prepare first.", description: "From accounts and savings to remittance and loans, check which services fit your situation and what you need to prepare.", purpose: "What financial service do you need most in Korea?", skip: "I do not know where to start", cta: "Start my financial life" },
  vi: { eyebrow: "Trợ lý định cư tài chính dựa trên thông tin chính thức", title: "Bắt đầu cuộc sống tài chính tại Hàn Quốc?", highlight: "SSAFIN cho bạn biết cần chuẩn bị gì trước.", description: "Từ tài khoản, tiết kiệm, chuyển tiền đến khoản vay, hãy kiểm tra dịch vụ phù hợp và những gì cần chuẩn bị.", purpose: "Bạn cần dịch vụ tài chính nào nhất tại Hàn Quốc?", skip: "Tôi chưa biết bắt đầu từ đâu", cta: "Bắt đầu cuộc sống tài chính" },
  zh: { eyebrow: "基于官方金融信息的外国人金融安居助手", title: "开始在韩国的金融生活？", highlight: "SSAFIN 告诉您应该先准备什么。", description: "从账户、储蓄、汇款到贷款，根据您的情况查看可使用的金融服务和所需准备事项。", purpose: "您目前在韩国最需要哪种金融服务？", skip: "我还不知道从哪里开始", cta: "开始我的金融生活" },
  ja: { eyebrow: "公式金融情報に基づく外国人向け金融生活エージェント", title: "韓国で金融生活を始めますか？", highlight: "SSAFINが最初に必要な準備をご案内します。", description: "口座・貯蓄・海外送金・ローンまで、ご自身の条件で利用できる金融サービスと必要な準備を確認できます。", purpose: "今、韓国で最も必要な金融サービスは何ですか？", skip: "何から始めればよいかわからない", cta: "金融生活を始める" },
  th: { eyebrow: "ผู้ช่วยด้านการเงินสำหรับชาวต่างชาติจากข้อมูลทางการ", title: "กำลังเริ่มต้นชีวิตทางการเงินในเกาหลีใช่ไหม", highlight: "SSAFIN จะแนะนำว่าควรเตรียมอะไรก่อน", description: "ตรวจสอบบริการทางการเงินที่เหมาะกับเงื่อนไขของคุณและสิ่งที่ต้องเตรียม ตั้งแต่บัญชี เงินออม การโอนเงิน ไปจนถึงสินเชื่อ", purpose: "ตอนนี้คุณต้องการบริการทางการเงินใดมากที่สุดในเกาหลี", skip: "ยังไม่รู้ว่าควรเริ่มจากตรงไหน", cta: "เริ่มต้นชีวิตทางการเงินของฉัน" },
} as const;

export default function HomePage() {
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const text = copy[locale];
  const [confirmed, setConfirmed] = useState(false);
  const [purpose, setPurpose] = useState<FinancialPurposeCode | null>(null);

  useEffect(() => {
    setPurpose(localStorage.getItem("visafyFinancialPurpose") as FinancialPurposeCode | null);
  }, []);

  function choosePurpose(value: FinancialPurposeCode) {
    if (purpose === value) {
      setPurpose(null);
      localStorage.removeItem("visafyFinancialPurpose");
      return;
    }
    setPurpose(value);
    localStorage.setItem("visafyFinancialPurpose", value);
  }

  function chooseLanguage(nextLocale: Locale) {
    if (confirmed && locale === nextLocale) {
      setConfirmed(false);
      setPurpose(null);
      localStorage.removeItem("visafyLocale");
      localStorage.removeItem("visafyFinancialPurpose");
      return;
    }
    setLocale(nextLocale);
    setConfirmed(true);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-canvas to-canvas text-ink">
      <div className="mx-auto w-full max-w-page px-5 py-6 sm:px-8">
        <header className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-control bg-ink text-lg font-bold text-white">S</span>
          <span className="text-xl font-bold">SSAFIN</span>
        </header>

        <section className="py-12 text-center sm:py-16">
          <p className="text-sm font-bold tracking-[0.18em] text-brand sm:text-base">SELECT YOUR LANGUAGE</p>
          <div className="mx-auto mt-6 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {localeOptions.map((option) => {
              const selected = confirmed && locale === option.locale;
              return (
                <button
                  aria-label={`Select ${option.language}`}
                  aria-pressed={selected}
                  className={`group relative rounded-card border px-3 py-5 shadow-card transition duration-200 hover:-translate-y-1 hover:border-line-strong ${selected ? "border-brand bg-brand-soft" : "border-line bg-surface"}`}
                  key={option.locale}
                  onClick={() => chooseLanguage(option.locale)}
                  type="button"
                >
                  {selected ? (
                    <span aria-hidden className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[11px] font-bold leading-none text-white">✓</span>
                  ) : null}
                  <span className="relative mx-auto block h-16 w-16 overflow-hidden rounded-full border border-line bg-white transition duration-200 group-hover:scale-105">
                    <Image alt="" className="object-cover" fill sizes="64px" src={flagImages[option.locale]} />
                  </span>
                  <span className={`mt-3 block text-sm font-bold transition duration-200 ${selected ? "text-brand" : ""}`}>{option.language}</span>
                </button>
              );
            })}
          </div>

          {confirmed ? (
            <div>
              <p className="ui-eyebrow mt-16">{text.eyebrow}</p>
              <h1 className="mx-auto mt-4 max-w-5xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                {text.title}<br /><span className="text-brand">{text.highlight}</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">{text.description}</p>
              <h2 className="mt-12 text-lg font-bold">{text.purpose}</h2>
              <div className="mx-auto mt-5 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {landingFinancialPurposes.map((value, index) => (
                  <button aria-pressed={purpose === value} className={`min-h-16 rounded-card border px-4 text-left text-sm font-semibold shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-line-strong ${purpose === value ? "border-brand bg-brand-soft text-brand" : "border-line bg-surface"}`} key={value} onClick={() => choosePurpose(value)} type="button">
                    {index === landingFinancialPurposes.length - 1 ? text.skip : financialPurposeLabel(locale, value)}
                  </button>
                ))}
              </div>
              <button className="ui-button ui-button-primary mt-9 min-h-12 px-7 shadow-card transition duration-200 enabled:hover:-translate-y-0.5" disabled={!purpose} onClick={() => purpose && router.push("/profile")} type="button">{text.cta} →</button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
