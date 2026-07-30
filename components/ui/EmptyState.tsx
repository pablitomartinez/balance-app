type EmptyStateProps = {
  title: string;
  description: string;
};

// Estado vacío reutilizable para pantallas sin datos cargados todavía.
export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-finance-line bg-white/70 p-5 text-center">
      <p className="text-sm font-semibold text-finance-ink">{title}</p>
      <p className="mt-1 text-sm text-finance-muted">{description}</p>
    </div>
  );
}
