"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { getFinancialJourney } from "@/services/financial-journey";

const statusClass = {
  COMPLETED: "border-status-success-border bg-status-success-bg text-status-success",
  CURRENT: "border-brand bg-brand-soft text-brand",
  UPCOMING: "border-line bg-surface-subtle text-muted",
  NEED_CONFIRMATION: "border-status-warning-border bg-status-warning-bg text-status-warning",
} as const;

export function FinancialJourneyPanel() {
  const { locale } = useLocale();
  const [sessionId, setSessionId] = useState<string | null>();
  useEffect(() => setSessionId(localStorage.getItem("visafyProfileSessionId")), []);
  const journey = useQuery({ queryKey: ["financial-journey", sessionId], queryFn: () => getFinancialJourney(sessionId!), enabled: Boolean(sessionId) });
  if (!sessionId || !journey.data) return null;
  const label = { ko: "현재 다음 행동", en: "Your next action", vi: "Hành động tiếp theo", zh: "下一步行动", ja: "次にすること", th: "ขั้นตอนถัดไป" }[locale];
  return <section className="ui-panel mt-8 p-6 sm:p-8" aria-labelledby="financial-journey-heading">
    <p className="ui-eyebrow">FINANCIAL JOURNEY</p>
    <h2 className="mt-2 text-2xl font-bold text-ink" id="financial-journey-heading">{journey.data.headline}</h2>
    <div className="ui-alert-info mt-4"><strong>{label}:</strong> {journey.data.nextAction}</div>
    <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {journey.data.steps.map((step) => <li className={`rounded-card border p-4 ${statusClass[step.status]}`} key={step.code}><div className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">{step.step}</span><h3 className="font-bold">{step.title}</h3></div><p className="mt-2 text-xs leading-5 opacity-80">{step.description}</p></li>)}
    </ol>
  </section>;
}
