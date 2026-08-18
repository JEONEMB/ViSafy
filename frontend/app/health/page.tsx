"use client";

import { useQuery } from "@tanstack/react-query";
import { getAiHealth, getBackendHealth } from "@/services/health";
import type { HealthStatus } from "@/types/health";

function StatusCard({ name, query }: { name: string; query: HealthStatus }) {
  const isUp = query.status === "UP";
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">{name}</h2>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${isUp ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
          {query.status}
        </span>
      </div>
      {query.message ? <p className="mt-3 text-sm text-slate-600">{query.message}</p> : null}
    </article>
  );
}

export default function HealthPage() {
  const backend = useQuery({ queryKey: ["health", "backend"], queryFn: getBackendHealth, retry: 1 });
  const ai = useQuery({ queryKey: ["health", "ai"], queryFn: getAiHealth, retry: 1 });

  const normalize = (status?: HealthStatus, error?: Error | null): HealthStatus =>
    status ?? { status: "DOWN", message: error?.message ?? "확인 중..." };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">System health</h1>
      <p className="mt-2 text-slate-600">Frontend에서 Backend와 AI Service의 상태를 확인합니다.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <StatusCard name="Backend" query={normalize(backend.data, backend.error)} />
        <StatusCard name="AI Service" query={normalize(ai.data, ai.error)} />
      </div>
    </main>
  );
}

