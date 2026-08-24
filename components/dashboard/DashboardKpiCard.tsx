import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardKpiCardProps = {
  label: string;
  value: string;
  supportingText: string;
  icon?: ReactNode;
  variant?: "default" | "accent";
};

export function DashboardKpiCard({
  label,
  value,
  supportingText,
  icon,
  variant = "default",
}: DashboardKpiCardProps) {
  const accent = variant === "accent";

  return (
    <article
      className={cn(
        "flex min-h-36 flex-col rounded-xl border p-4 shadow-soft sm:p-5",
        accent
          ? "border-brand-border bg-brand-muted"
          : "border-border bg-card"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={cn("text-sm font-semibold", accent ? "text-primary" : "text-muted-foreground")}>
          {label}
        </p>
        {icon && (
          <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", accent ? "bg-primary text-primary-foreground" : "bg-muted text-primary")}>
            {icon}
          </span>
        )}
      </div>
      <p className="mt-4 break-words text-2xl font-black leading-tight text-foreground">{value}</p>
      <p className="mt-auto break-words pt-2 text-sm text-muted-foreground">{supportingText}</p>
    </article>
  );
}
