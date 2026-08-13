"use client";

import { Section } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useHome } from "@/hooks/useHome";
import { useApprovals } from "@/hooks/useApprovals";

export default function ApprovalsPage() {
  const { user, loading: authLoading } = useAuth();
  

  const {
    home,
    loading: homeLoading,
  } = useHome(user?.id ?? null);
  

  const {
    approvals,
    loading: approvalsLoading,
    error,
    actionLoading,
    approve,
    reject,
  } = useApprovals(
    user?.id ?? null,
    home?.id ?? null
  );

  const loading =
    authLoading ||
    homeLoading ||
    approvalsLoading;

  if (loading) {
    return (
      <Section title="Aprobaciones">
        <p className="text-sm text-muted-foreground">
          Cargando aprobaciones...
        </p>
      </Section>
    );
  }

  return (
    <Section title="Aprobaciones">
      {error && (
        <div
          className="mb-4 rounded-md border border-destructive-border bg-destructive-muted p-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      {approvals.length === 0 ? (
        <EmptyState
          title="Sin aprobaciones pendientes"
          description="Cuando la otra persona cree un gasto, vas a poder confirmarlo desde acá."
        />
      ) : (
        <div className="space-y-4">
          {approvals.map((approval) => {
            const isLoading =
              actionLoading === approval.expenseId;

            return (
              <article
                key={approval.id}
                className="rounded-md border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">
                      {approval.description}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {approval.paymentMethod}
                    </p>
                  </div>

                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(approval.amount)}
                  </p>
                </div>

                <div className="mt-4 flex gap-3">
                  <Button
                    type="button"
                    disabled={isLoading}
                    onClick={() =>
                      reject(approval.expenseId)
                    }
                  >
                    {isLoading ? "Procesando..." : "Rechazar"}
                  </Button>

                  <Button
                    type="button"
                    disabled={isLoading}
                    onClick={() =>
                      approve(approval.expenseId)
                    }
                  >
                    {isLoading ? "Procesando..." : "Aprobar"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Section>
  );
}