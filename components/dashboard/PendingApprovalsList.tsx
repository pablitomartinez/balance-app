import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import type { PendingApproval } from "@/types/models";

type PendingApprovalsListProps = {
  approvals: PendingApproval[];
};

// Lista de aprobaciones pendientes. La acción real se implementará en el módulo de aprobaciones.
export function PendingApprovalsList({ approvals }: PendingApprovalsListProps) {
  if (approvals.length === 0) {
    return (
      <EmptyState
        title="Sin aprobaciones pendientes"
        description="Los gastos nuevos van a requerir confirmación de la otra persona."
      />
    );
  }

  return (
    <div className="space-y-3">
      {approvals.map((approval) => (
        <article className="rounded-md border border-border bg-card p-4" key={approval.id}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground">{approval.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Solicitado por {approval.requestedByName}
              </p>
            </div>
            <p className="text-sm font-bold text-warning">
              {formatCurrency(approval.amount)}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
