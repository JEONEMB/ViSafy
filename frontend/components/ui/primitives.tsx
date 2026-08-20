import type { HTMLAttributes, ReactNode } from "react";

export type StatusTone = "success" | "warning" | "danger" | "neutral" | "info";

const statusClasses: Record<StatusTone, string> = {
  success: "border-status-success-border bg-status-success-bg text-status-success",
  warning: "border-status-warning-border bg-status-warning-bg text-status-warning",
  danger: "border-status-danger-border bg-status-danger-bg text-status-danger",
  neutral: "border-status-neutral-border bg-status-neutral-bg text-status-neutral",
  info: "border-status-info-border bg-status-info-bg text-status-info",
};

export const ui = {
  page: "ui-page",
  card: "ui-card",
  panel: "ui-panel",
  input: "ui-input",
  label: "ui-label",
  primaryButton: "ui-button ui-button-primary",
  secondaryButton: "ui-button ui-button-secondary",
  quietButton: "ui-button ui-button-quiet",
  link: "ui-link",
} as const;

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function PageHeader({ eyebrow, title, description, className }: { eyebrow?: string; title: string; description?: string; className?: string }) {
  return (
    <header className={cx("max-w-reading", className)}>
      {eyebrow ? <p className="ui-eyebrow">{eyebrow}</p> : null}
      <h1 className="ui-page-heading mt-2">{title}</h1>
      {description ? <p className="mt-3 max-w-2xl text-base leading-7 text-muted">{description}</p> : null}
    </header>
  );
}

export function Surface({ children, className, ...props }: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return <section className={cx("ui-card", className)} {...props}>{children}</section>;
}

export function StatusBadge({ tone, children, className }: { tone: StatusTone; children: ReactNode; className?: string }) {
  return <span className={cx("inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-xs font-semibold", statusClasses[tone], className)}>{children}</span>;
}

export function StatusAlert({ tone, title, children, className }: { tone: StatusTone; title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cx("rounded-card border p-4 text-sm leading-6", statusClasses[tone], className)} role={tone === "danger" ? "alert" : "status"}>
      {title ? <p className="font-bold">{title}</p> : null}
      <div className={title ? "mt-1" : undefined}>{children}</div>
    </div>
  );
}
