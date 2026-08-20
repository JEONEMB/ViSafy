"use client";

import { useQuery } from "@tanstack/react-query";
import { getAiHealth, getBackendHealth } from "@/services/health";
import type { HealthStatus } from "@/types/health";

function StatusCard({ name, query }: { name: string; query: HealthStatus }) {
  const isUp = query.status === "UP";
  return (
    <article className="ui-card p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">{name}</h2>
        <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${isUp ? "border-status-success-border bg-status-success-bg text-status-success" : "border-status-danger-border bg-status-danger-bg text-status-danger"}`}>
          {query.status}
        </span>
      </div>
      {query.message ? <p className="mt-3 text-sm text-muted">{query.message}</p> : null}
    </article>
  );
}

export default function HealthPage() {
  const backend = useQuery({ queryKey: ["health", "backend"], queryFn: getBackendHealth, retry: 1 });
  const ai = useQuery({ queryKey: ["health", "ai"], queryFn: getAiHealth, retry: 1 });

  const normalize = (status?: HealthStatus, error?: Error | null): HealthStatus =>
    status ?? { status: "DOWN", message: error?.message ?? "확인 중..." };

  return (
    <main className="ui-page max-w-3xl">
      <h1 className="ui-page-heading">System health</h1>
      <p className="mt-2 text-muted">Frontend에서 Backend와 AI Service의 상태를 확인합니다.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <StatusCard name="Backend" query={normalize(backend.data, backend.error)} />
        <StatusCard name="AI Service" query={normalize(ai.data, ai.error)} />
      </div>
    </main>
  );
}
