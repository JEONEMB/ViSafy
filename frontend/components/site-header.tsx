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
  const navLink = (href: string) => {
    const active = pathname === href || (href !== "/profile" && pathname.startsWith(`${href}/`));
    return `inline-flex min-h-11 items-center rounded-control px-3 text-sm font-semibold transition ${active ? "bg-brand-soft text-brand" : "text-muted hover:bg-surface-subtle hover:text-ink"}`;
  };
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95">
      <nav className="mx-auto flex max-w-page flex-wrap items-center gap-1 px-5 py-2 sm:px-6 lg:px-8" aria-label="Primary navigation">
        <Link className="mr-auto inline-flex min-h-11 items-center gap-2 rounded-control pr-3 text-lg font-bold tracking-tight text-ink" href="/">
          <span className="flex h-8 w-8 items-center justify-center rounded-control bg-ink text-sm text-white" aria-hidden>S</span>
          SSAFIN
        </Link>
        <Link aria-current={pathname.startsWith("/products") ? "page" : undefined} className={navLink("/products")} href="/products">{text.nav.products}</Link>
        <Link aria-current={pathname === "/profile" ? "page" : undefined} className={navLink("/profile")} href="/profile">{text.nav.profile}</Link>
        {authenticated ? <Link aria-current={pathname === "/admin/products" ? "page" : undefined} className={navLink("/admin/products")} href="/admin/products">{text.nav.productAdmin}</Link> : null}
        {authenticated ? <Link aria-current={pathname === "/admin/sources" ? "page" : undefined} className={navLink("/admin/sources")} href="/admin/sources">{text.nav.admin}</Link> : null}
        {authenticated ? <button className="ui-button ui-button-quiet" type="button" onClick={logout}>{text.nav.logout}</button> : <Link className="ui-button ui-button-quiet" href="/admin/login">{text.nav.adminLogin}</Link>}
        <Link className={`${navLink("/health")} hidden lg:inline-flex`} href="/health">{text.nav.health}</Link>
      </nav>
    </header>
  );
}
