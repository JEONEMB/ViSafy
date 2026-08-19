"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/providers/admin-auth-provider";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authenticated, ready } = useAdminAuth();
  const loginPage = pathname === "/admin/login";

  useEffect(() => {
    if (ready && !authenticated && !loginPage) {
      sessionStorage.setItem("visafyAdminReturnPath", pathname);
      router.replace("/admin/login");
    }
  }, [authenticated, loginPage, pathname, ready, router]);

  if (loginPage) return children;
  if (!ready || !authenticated) return <main className="mx-auto max-w-3xl px-6 py-16 text-center text-slate-500">관리자 인증을 확인하고 있습니다...</main>;
  return children;
}
