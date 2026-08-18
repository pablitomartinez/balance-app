"use client";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useHome } from "@/hooks/useHome";
import { useApprovals } from "@/hooks/useApprovals";

function ApprovalsSkeleton() {
  return (
    <div className="space-y-2">
      <div className="rounded-md border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>

          <Skeleton className="h-6 w-24" />
        </div>

        <div className="mt-4 flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-28" />
          </div>

          <Skeleton className="h-6 w-20" />
        </div>

        <div className="mt-4 flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    </div>
  );
}

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
    removingApprovalId,
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
      <div>
        <h2 className="text-2xl font-black text-foreground">
          Revisar gastos
        </h2>
        <p className="mb-4 text-m leading-6 text-muted-foreground">
          Revisá los gastos que registró la otra persona.
          Al aprobarlos, pasan a formar parte de las cuentas del hogar.
        </p>

        <ApprovalsSkeleton />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-foreground">
        Revisar gastos
      </h2>
      <p className=" mb-4 text-m leading-6 text-muted-foreground">
        Revisá los gastos que registró la otra persona. Al aprobarlos, pasan a formar parte de las cuentas del hogar.
      </p>

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

            const isRemoving =
              removingApprovalId === approval.expenseId;

            return (
              <article
                key={approval.id}
                className={`rounded-md border border-border bg-card p-4 transition-all duration-200 ease-out ${isRemoving
                  ? "translate-y-1 opacity-0"
                  : "translate-y-0 opacity-100"
                  }`}
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
    </div>
  );
}