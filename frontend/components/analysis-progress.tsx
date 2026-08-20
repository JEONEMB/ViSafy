"use client";

import { useLocale } from "@/components/providers/locale-provider";

const copy = {
  ko: ["사용자 조건 확인", "검수된 상품조건 비교", "추가 확인 조건 탐지", "공식 근거 불러오기"],
  en: ["Checking your information", "Comparing reviewed product conditions", "Detecting additional checks", "Loading official evidence"],
  vi: ["Kiểm tra điều kiện người dùng", "So sánh điều kiện sản phẩm đã duyệt", "Phát hiện điều kiện cần xác nhận", "Tải căn cứ chính thức"],
} as const;

export function AnalysisProgress({ recommendationDone = false, evidenceRequested = false, evidenceDone = false }: { recommendationDone?: boolean; evidenceRequested?: boolean; evidenceDone?: boolean }) {
  const { locale } = useLocale();
  const labels = copy[locale];
  const states: Array<"done" | "active" | "idle"> = recommendationDone
    ? ["done", "done", "done", evidenceRequested ? (evidenceDone ? "done" : "active") : "idle"]
    : ["active", "active", "active", "idle"];
  return <div className="rounded-card border border-status-info-border bg-status-info-bg p-5" aria-live="polite"><ol className="grid gap-3 sm:grid-cols-2">{labels.map((label, index) => <li className={`flex items-center gap-3 text-sm font-semibold ${states[index] === "idle" ? "text-quiet" : states[index] === "done" ? "text-status-success" : "text-status-info"}`} key={label}><span className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${states[index] === "done" ? "border-status-success bg-status-success text-white" : states[index] === "active" ? "animate-pulse border-brand bg-brand text-white" : "border-line-strong bg-surface"}`}>{states[index] === "done" ? "✓" : states[index] === "active" ? "•" : "○"}</span>{label}</li>)}</ol></div>;
}
