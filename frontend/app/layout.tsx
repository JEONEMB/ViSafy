import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/app-providers";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

// Baked in at build time, like NEXT_PUBLIC_API_URL, so a domain change needs a rebuild.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const title = "SSAFIN — 외국인을 위한 공식근거 기반 금융 AI Agent";
const description =
  "한국에 사는 외국인이 은행 창구에 가기 전에 필요한 서류, 조건, 물어볼 질문을 모국어로 준비합니다. 모든 안내는 은행 공식 문서에 근거합니다.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "SSAFIN",
    title,
    description: "창구에 가기 전, 서류·조건·질문을 모국어로 준비하세요. 모든 안내는 공식 문서 근거로 추적됩니다.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "SSAFIN" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: "창구에 가기 전, 서류·조건·질문을 모국어로 준비하세요.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const language = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE ?? "ko";

  return (
    <html lang={language}>
      <body>
        <AppProviders>
          <SiteHeader />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
