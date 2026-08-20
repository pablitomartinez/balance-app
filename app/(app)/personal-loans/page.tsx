"use client";

import { useState } from "react";
import { PersonalLoanForm } from "@/components/personal-loans/PersonalLoanForm";
import { PersonalLoanList } from "@/components/personal-loans/PersonalLoanList";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useHome } from "@/hooks/useHome";
import { usePersonalLoans } from "@/hooks/usePersonalLoans";
import { formatCurrency } from "@/lib/utils";

function debtMessage(direction: ReturnType<typeof usePersonalLoans>["direction"], otherMemberName: string | null) {
  const other = otherMemberName ?? "la otra persona";
  if (direction === "current_user_owes") return `Le debés a ${other}`;
  if (direction === "other_user_owes") return `${other} te debe`;
  return "No hay deuda personal pendiente";
}

export default function PersonalLoansPage() {
  const { user, loading: authLoading } = useAuth();
  const { home, otherMemberName, loading: homeLoading } = useHome(user?.id ?? null);
  const { loans, loading: loansLoading, error, reload, totalPersonalDebt, direction } = usePersonalLoans(home?.id ?? null, user?.id ?? null);
  const [showForm, setShowForm] = useState(false);

  if (authLoading || homeLoading) {
    return <div className="space-y-6"><Skeleton className="h-10 w-64" /><Skeleton className="h-32 w-full" /><Skeleton className="h-36 w-full" /></div>;
  }

  if (!user || !home) {
    return <p className="text-sm text-muted-foreground">Necesitás tener un hogar configurado para usar préstamos personales.</p>;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-black text-foreground">Préstamos personales</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Dinero que uno de ustedes adelantó por el otro.</p>
        </div>
        <Button type="button" className="shrink-0" onClick={() => setShowForm((current) => !current)}>{showForm ? "Cerrar" : "+ Préstamo"}</Button>
      </div>

      <section className="rounded-md bg-card p-5 shadow-soft">
        <p className="text-sm font-semibold text-muted-foreground">Deuda personal</p>
        <p className="mt-2 text-lg font-bold text-foreground">{debtMessage(direction, otherMemberName)}</p>
        <p className="mt-2 text-3xl font-black text-foreground">{formatCurrency(totalPersonalDebt)}</p>
      </section>

      <div className={["grid transition-all duration-300 ease-out", showForm ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"].join(" ")}>
        <div className="min-h-0 overflow-hidden">
          <Section title="Nuevo préstamo">
            <div className="pt-1"><PersonalLoanForm otherMemberName={otherMemberName} onCreated={() => { reload(); setShowForm(false); }} /></div>
          </Section>
        </div>
      </div>

      <Section title="Préstamos">
        {error ? <p role="alert" className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p> : <PersonalLoanList loans={loans} currentUserId={user.id} loading={loansLoading} onPaymentRecorded={reload} />}
      </Section>
    </div>
  );
}
