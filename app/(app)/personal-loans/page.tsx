"use client";

import { useState } from "react";
import { HandCoins, Plus } from "lucide-react";
import { getPersonalDebtMessage } from "@/components/personal-loans/PersonalDebtCard";
import { PersonalLoanForm } from "@/components/personal-loans/PersonalLoanForm";
import { PersonalLoanList } from "@/components/personal-loans/PersonalLoanList";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useHome } from "@/hooks/useHome";
import { usePersonalLoans } from "@/hooks/usePersonalLoans";
import { formatCurrency } from "@/lib/utils";

function PersonalLoansSkeleton() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Skeleton className="h-7 w-52" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Skeleton className="h-11 w-40" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
        <Skeleton className="h-5 w-24" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function PersonalLoansPage() {
  const { user, loading: authLoading } = useAuth();
  const { home, otherMemberName, loading: homeLoading } = useHome(
    user?.id ?? null
  );
  const {
    loans,
    loading: loansLoading,
    error,
    reload,
    totalPersonalDebt,
    direction,
  } = usePersonalLoans(home?.id ?? null, user?.id ?? null);
  const [showForm, setShowForm] = useState(false);

  if (authLoading || homeLoading) {
    return <PersonalLoansSkeleton />;
  }

  if (!user || !home) {
    return (
      <p className="text-sm text-muted-foreground">
        Necesitás tener un hogar configurado para usar préstamos personales.
      </p>
    );
  }

  function openLoanForm() {
    setShowForm(true);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 lg:max-w-none lg:space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-black text-foreground">
            <span className="lg:hidden">Préstamos personales</span>
            <span className="hidden lg:inline">Préstamos</span>
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Dinero prestado entre ustedes fuera de los gastos compartidos.
          </p>
        </div>
        <Button
          type="button"
          className="shrink-0 gap-2"
          onClick={() => setShowForm((current) => !current)}
        >
          {!showForm && (
            <Plus aria-hidden="true" className="hidden h-4 w-4 lg:block" />
          )}
          {showForm ? (
            "Cerrar"
          ) : (
            <>
              <span className="lg:hidden">+ Préstamo</span>
              <span className="hidden lg:inline">Registrar préstamo</span>
            </>
          )}
        </Button>
      </div>

      <section className="rounded-xl border border-brand-border bg-brand-muted p-5 shadow-soft lg:flex lg:min-h-32 lg:items-center lg:justify-between lg:gap-8 lg:px-6">
        <div className="flex items-start gap-3">
          <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground lg:flex">
            <HandCoins aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-primary">
              Balance personal
            </p>
            <p className="mt-2 text-lg font-bold text-foreground">
              {getPersonalDebtMessage(direction, otherMemberName)}
            </p>
          </div>
        </div>
        <p className="mt-3 break-words text-3xl font-black text-foreground lg:mt-0 lg:text-right">
          {formatCurrency(totalPersonalDebt)}
        </p>
      </section>

      <div
        className={[
          "grid transition-all duration-300 ease-out",
          showForm
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="min-h-0 overflow-hidden lg:max-w-2xl">
          <Section title="Nuevo préstamo">
            <div className="pt-1">
              <PersonalLoanForm
                otherMemberName={otherMemberName}
                onCreated={() => {
                  reload();
                  setShowForm(false);
                }}
              />
            </div>
          </Section>
        </div>
      </div>

      <section className="space-y-3 lg:rounded-xl lg:border lg:border-border lg:bg-card lg:p-5 lg:shadow-soft">
        <h2 className="text-base font-bold text-foreground">Préstamos</h2>
        {error ? (
          <p
            role="alert"
            className="rounded-md border border-destructive-border bg-destructive-muted px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        ) : (
          <PersonalLoanList
            loans={loans}
            currentUserId={user.id}
            loading={loansLoading}
            onPaymentRecorded={reload}
            emptyAction={
              <Button type="button" onClick={openLoanForm}>
                Registrar el primer préstamo
              </Button>
            }
          />
        )}
      </section>
    </div>
  );
}
