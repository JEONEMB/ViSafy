"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/providers/locale-provider";
import { useAdminAuth } from "@/components/providers/admin-auth-provider";

export function SiteHeader() {
  const pathname = usePathname();
  const { text } = useLocale();
  const { authenticated, logout } = useAdminAuth();
  if (pathname === "/") return null;
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 text-xs font-semibold sm:gap-x-5 sm:px-6 sm:py-4 sm:text-sm">
        <Link className="mr-auto text-lg text-teal-700" href="/">ViSafy</Link>
        <Link href="/products">{text.nav.products}</Link>
        <Link href="/profile">{text.nav.profile}</Link>
        {authenticated ? <Link href="/admin/products">{text.nav.productAdmin}</Link> : null}
        {authenticated ? <Link href="/admin/sources">{text.nav.admin}</Link> : null}
        {authenticated ? <button type="button" onClick={logout}>{text.nav.logout}</button> : <Link href="/admin/login">{text.nav.adminLogin}</Link>}
        <Link className="hidden lg:inline" href="/health">{text.nav.health}</Link>
      </nav>
    </header>
  );
}
