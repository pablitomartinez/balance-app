"use client";

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
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function statusLabel(status: PersonalLoanListItem["status"]) {
  if (status === "paid") return "Pagado";
  if (status === "cancelled") return "Cancelado";
  return "Pendiente";
}

export function PersonalLoanList({ loans, currentUserId, loading = false, onPaymentRecorded }: PersonalLoanListProps) {
  const [payingLoanId, setPayingLoanId] = useState<string | null>(null);

  if (loading) {
    return <div className="space-y-3"><Skeleton className="h-36 w-full" /><Skeleton className="h-36 w-full" /></div>;
  }

  if (loans.length === 0) {
    return <EmptyState title="Sin préstamos personales" description="Los préstamos que registren aparecerán acá." />;
  }

  return (
    <div className="space-y-3">
      {loans.map((loan) => {
        const canPay = loan.status === "open" && loan.borrowerId === currentUserId && loan.remainingAmount > 0;
        return (
          <article key={loan.id} className="rounded-md border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-foreground">{loan.description}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{loan.lenderName} le prestó a {loan.borrowerName} · {formatDate(loan.loanDate)}</p>
              </div>
              <span className="shrink-0 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">{statusLabel(loan.status)}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-muted-foreground">Monto original</p><p className="mt-1 font-bold text-foreground">{formatCurrency(loan.principalAmount)}</p></div>
              <div><p className="text-xs text-muted-foreground">Saldo pendiente</p><p className="mt-1 font-bold text-foreground">{formatCurrency(loan.remainingAmount)}</p></div>
            </div>
            {loan.totalPaid > 0 && <p className="mt-3 text-xs text-muted-foreground">Pagado: {formatCurrency(loan.totalPaid)}</p>}
            {canPay && payingLoanId !== loan.id && <Button type="button" variant="secondary" className="mt-4 w-full" onClick={() => setPayingLoanId(loan.id)}>Registrar pago</Button>}
            {payingLoanId === loan.id && <PersonalLoanPaymentForm loanId={loan.id} remainingAmount={loan.remainingAmount} onCancel={() => setPayingLoanId(null)} onRecorded={() => { setPayingLoanId(null); onPaymentRecorded(); }} />}
          </article>
        );
      })}
    </div>
  );
}
