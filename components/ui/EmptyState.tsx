import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

// Estado vacío reutilizable para pantallas sin datos cargados todavía.
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-border bg-card p-5 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
