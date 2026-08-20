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

  if (authenticated) return <main className="ui-page max-w-md text-center">이미 관리자 로그인이 되어 있습니다.</main>;

  return (
    <main className="ui-page max-w-md">
      <div className="ui-card p-8">
        <p className="ui-eyebrow">SERVICE ADMIN ONLY</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">관리자 로그인</h1>
        <p className="mt-3 text-sm leading-6 text-muted">금융상품과 공식 Source·Rule은 승인된 서비스 관리자만 확인하고 수정할 수 있습니다.</p>
        {error ? <p className="ui-alert-danger mt-5" role="alert">{error}</p> : null}
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="ui-label block">관리자 아이디<input className="ui-input" name="username" autoComplete="username" required /></label>
          <label className="ui-label block">비밀번호<input className="ui-input" name="password" type="password" autoComplete="current-password" required /></label>
          <button className="ui-button ui-button-primary w-full" disabled={pending}>{pending ? "확인 중..." : "관리자 로그인"}</button>
        </form>
      </div>
    </main>
  );
}
