"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAdminAuth } from "@/components/providers/admin-auth-provider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { authenticated, login } = useAdminAuth();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      await login(String(data.get("username")), String(data.get("password")));
      const returnPath = sessionStorage.getItem("visafyAdminReturnPath") ?? "/admin/products";
      sessionStorage.removeItem("visafyAdminReturnPath");
      router.replace(returnPath);
    } catch {
      setError("관리자 아이디 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setPending(false);
    }
  }

  if (authenticated) return <main className="mx-auto max-w-md px-6 py-16 text-center">이미 관리자 로그인이 되어 있습니다.</main>;

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-blue-700">SERVICE ADMIN ONLY</p>
        <h1 className="mt-2 text-3xl font-bold">관리자 로그인</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">금융상품과 공식 Source·Rule은 승인된 서비스 관리자만 확인하고 수정할 수 있습니다.</p>
        {error ? <p className="mt-5 rounded-lg bg-rose-100 p-3 text-sm text-rose-800">{error}</p> : null}
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-medium">관리자 아이디<input className="mt-1 w-full rounded-lg border px-3 py-2" name="username" autoComplete="username" required /></label>
          <label className="block text-sm font-medium">비밀번호<input className="mt-1 w-full rounded-lg border px-3 py-2" name="password" type="password" autoComplete="current-password" required /></label>
          <button className="w-full rounded-lg bg-slate-950 px-4 py-3 font-semibold text-white disabled:opacity-50" disabled={pending}>{pending ? "확인 중..." : "관리자 로그인"}</button>
        </form>
      </div>
    </main>
  );
}
