import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "ViSafy",
  description: "Visa-aware Financial Agent",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const language = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE ?? "ko";

  return (
    <html lang={language}>
      <body>
        <AppProviders>
          <header className="border-b border-slate-200 bg-white">
            <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4 text-sm font-semibold">
              <Link className="mr-auto text-lg text-teal-700" href="/">ViSafy</Link>
              <Link href="/profile">프로필</Link>
              <Link href="/admin/sources">Source · Rule 검수</Link>
              <Link href="/health">Health</Link>
            </nav>
          </header>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
