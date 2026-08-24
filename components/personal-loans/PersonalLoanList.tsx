"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { PersonalLoanPaymentForm } from "@/components/personal-loans/PersonalLoanPaymentForm";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import type { PersonalLoanListItem } from "@/hooks/usePersonalLoans";
import { formatCurrency } from "@/lib/utils";

type PersonalLoanListProps = {
  loans: PersonalLoanListItem[];
  currentUserId: string;
  loading?: boolean;
  onPaymentRecorded: () => void;
  emptyAction?: ReactNode;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function statusLabel(status: PersonalLoanListItem["status"]) {
  if (status === "paid") return "Pagado";
  if (status === "cancelled") return "Cancelado";
  return "Pendiente";
}

function statusClassName(status: PersonalLoanListItem["status"]) {
  if (status === "paid") {
    return "border-success-border bg-success-muted text-success";
  }
  if (status === "cancelled") {
    return "border-border bg-muted text-muted-foreground";
  }
  return "border-warning-border bg-warning-muted text-warning";
}

function PersonalLoanSkeleton() {
  return (
    <article className="rounded-md border border-border bg-card p-4 lg:rounded-none lg:border-x-0 lg:border-t-0">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-[minmax(0,1.4fr)_7.5rem_8rem_8rem_8.5rem] lg:items-center lg:gap-4">
        <div className="col-span-2 space-y-2 lg:col-span-1">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="col-span-2 flex items-center justify-between gap-3 lg:col-span-1 lg:block">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-20 rounded-full lg:mt-2" />
        </div>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="col-span-2 h-10 w-full lg:col-span-1" />
      </div>
    </article>
  );
}

export function PersonalLoanList({
  loans,
  currentUserId,
  loading = false,
  onPaymentRecorded,
  emptyAction,
}: PersonalLoanListProps) {
  const [payingLoanId, setPayingLoanId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-3 lg:overflow-hidden lg:rounded-lg lg:border lg:border-border lg:bg-card lg:space-y-0">
        <PersonalLoanSkeleton />
        <PersonalLoanSkeleton />
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <EmptyState
        title="Sin préstamos personales"
        description="Los préstamos que registren aparecerán acá."
        action={emptyAction}
      />
    );
  }

  return (
    <div className="space-y-3 lg:overflow-hidden lg:rounded-lg lg:border lg:border-border lg:bg-card lg:space-y-0">
      {loans.map((loan) => {
        const canPay =
          loan.status === "open" &&
          loan.borrowerId === currentUserId &&
          loan.remainingAmount > 0;

        return (
          <article
            key={loan.id}
            className="rounded-md border border-border bg-card p-4 transition lg:rounded-none lg:border-x-0 lg:border-t-0 lg:hover:bg-muted/40 lg:last:border-b-0"
          >
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-[minmax(0,1.4fr)_7.5rem_8rem_8rem_8.5rem] lg:items-center lg:gap-4">
              <div className="col-span-2 flex min-w-0 flex-col lg:col-span-1">
                <h3 className="order-1 truncate text-sm font-semibold text-foreground lg:order-2 lg:mt-1 lg:text-xs lg:font-normal lg:text-muted-foreground">
                  {loan.description}
                </h3>
                <p className="order-2 mt-1 break-words text-xs text-muted-foreground lg:order-1 lg:mt-0 lg:text-sm lg:font-semibold lg:text-foreground">
                  {loan.lenderName} → {loan.borrowerName}
                </p>
              </div>

              <div className="col-span-2 flex items-center justify-between gap-3 lg:col-span-1 lg:block">
                <p className="text-xs text-muted-foreground">
                  {formatDate(loan.loanDate)}
                </p>
                <span
                  className={`w-fit shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold lg:mt-2 lg:inline-block ${statusClassName(
                    loan.status
                  )}`}
                >
                  {statusLabel(loan.status)}
                </span>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Monto original</p>
                <p className="mt-1 whitespace-nowrap text-sm font-bold text-foreground">
                  {formatCurrency(loan.principalAmount)}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Saldo pendiente</p>
                <p className="mt-1 whitespace-nowrap text-sm font-bold text-foreground">
                  {formatCurrency(loan.remainingAmount)}
                </p>
                {loan.totalPaid > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pagado: {formatCurrency(loan.totalPaid)}
                  </p>
                )}
              </div>

              <div className="col-span-2 lg:col-span-1">
                {canPay && payingLoanId !== loan.id && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => setPayingLoanId(loan.id)}
                  >
                    Registrar pago
                  </Button>
                )}
              </div>
            </div>

            {payingLoanId === loan.id && (
              <div className="lg:ml-auto lg:max-w-xl">
                <PersonalLoanPaymentForm
                  loanId={loan.id}
                  remainingAmount={loan.remainingAmount}
                  onCancel={() => setPayingLoanId(null)}
                  onRecorded={() => {
                    setPayingLoanId(null);
                    onPaymentRecorded();
                  }}
                />
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
