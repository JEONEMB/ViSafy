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
  return <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5" aria-live="polite"><ol className="grid gap-3 sm:grid-cols-2">{labels.map((label, index) => <li className={`flex items-center gap-3 text-sm font-semibold ${states[index] === "idle" ? "text-slate-400" : states[index] === "done" ? "text-emerald-800" : "text-blue-800"}`} key={label}><span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${states[index] === "done" ? "bg-emerald-600 text-white" : states[index] === "active" ? "animate-pulse bg-blue-600 text-white" : "border border-slate-300 bg-white"}`}>{states[index] === "done" ? "✓" : states[index] === "active" ? "•" : "○"}</span>{label}</li>)}</ol></div>;
}
