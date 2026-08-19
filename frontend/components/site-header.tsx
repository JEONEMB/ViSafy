"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/providers/locale-provider";

export function SiteHeader() {
  const pathname = usePathname();
  const { text } = useLocale();
  if (pathname === "/") return null;
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-6 py-4 text-sm font-semibold">
        <Link className="mr-auto text-lg text-teal-700" href="/">ViSafy</Link>
        <Link href="/products">{text.nav.products}</Link>
        <Link href="/profile">{text.nav.profile}</Link>
        <Link href="/admin/products">{text.nav.productAdmin}</Link>
        <Link href="/admin/sources">{text.nav.admin}</Link>
        <Link className="hidden lg:inline" href="/health">{text.nav.health}</Link>
      </nav>
    </header>
  );
}
