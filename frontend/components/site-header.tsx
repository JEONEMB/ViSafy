"use client";

import Link from "next/link";
import { useLocale } from "@/components/providers/locale-provider";

export function SiteHeader() {
  const { text } = useLocale();
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4 text-sm font-semibold">
        <Link className="mr-auto text-lg text-teal-700" href="/">ViSafy</Link>
        <Link href="/profile">{text.nav.profile}</Link>
        <Link href="/admin/sources">{text.nav.admin}</Link>
        <Link href="/health">{text.nav.health}</Link>
      </nav>
    </header>
  );
}
