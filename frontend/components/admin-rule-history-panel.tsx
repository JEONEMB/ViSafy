"use client";

import { useQuery } from "@tanstack/react-query";
import { getRuleHistory } from "@/services/data-pipeline";

export function AdminRuleHistoryPanel({ ruleId }: { ruleId: number }) {
  const history = useQuery({ queryKey: ["rule-history", ruleId], queryFn: () => getRuleHistory(ruleId) });
  if (history.isLoading) return <p className="mt-4 rounded-control bg-surface-subtle p-4 text-sm text-muted">변경 이력을 불러오는 중...</p>;
  if (history.isError) return <p className="ui-alert-danger mt-4">변경 이력을 불러오지 못했습니다.</p>;
  return <section className="mt-4 rounded-card border border-line bg-surface-subtle p-4"><h4 className="font-bold text-ink">Rule 변경 이력</h4>{history.data?.length ? <ol className="mt-3 space-y-3">{history.data.map((item) => <li className="rounded-control border border-line bg-surface p-4 text-xs" key={item.id}><div className="flex flex-wrap justify-between gap-2"><strong>{item.action} · {item.reviewer}</strong><time className="text-quiet">{new Date(item.reviewedAt).toLocaleString()}</time></div><div className="mt-3 grid gap-2 sm:grid-cols-2"><div className="rounded-control border border-status-danger-border bg-status-danger-bg p-3"><p className="font-bold text-status-danger">변경 전 · {item.beforeStatus}</p><p className="mt-1">{item.beforeOperator} {item.beforeValue} · {item.beforeLevel}</p></div><div className="rounded-control border border-status-success-border bg-status-success-bg p-3"><p className="font-bold text-status-success">변경 후 · {item.afterStatus}</p><p className="mt-1">{item.afterOperator} {item.afterValue} · {item.afterLevel}</p></div></div></li>)}</ol> : <p className="mt-3 text-sm text-muted">아직 검수 변경 이력이 없습니다.</p>}</section>;
}
