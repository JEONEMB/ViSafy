import type { Metadata } from "next";
import type { ReactNode } from "react";
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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

