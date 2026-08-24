"use client";

import Link from "next/link";
import { CheckCheck, HandCoins, ReceiptText, Scale } from "lucide-react";
import { getBalanceMessage } from "@/components/dashboard/BalanceCard";
import { DashboardKpiCard } from "@/components/dashboard/DashboardKpiCard";
import { PendingApprovalsList } from "@/components/dashboard/PendingApprovalsList";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentExpensesList } from "@/components/dashboard/RecentExpensesList";
import { getPersonalDebtMessage } from "@/components/personal-loans/PersonalDebtCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useHome } from "@/hooks/useHome";
import { usePersonalLoans } from "@/hooks/usePersonalLoans";
import { formatCurrency } from "@/lib/utils";

const panelClassName =
  "rounded-xl border border-border bg-card p-4 shadow-soft sm:p-5";

function DashboardSkeleton() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="min-w-0">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-52" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton className="h-36 w-full rounded-xl" key={index} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <div className={panelClassName}>
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="mt-4 space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>

        <div className="space-y-6">
          <div className={panelClassName}>
            <Skeleton className="h-5 w-48" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
          <div className={panelClassName}>
            <Skeleton className="h-5 w-32" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type PanelHeaderProps = {
  title: string;
  href?: string;
  actionLabel?: string;
};

function PanelHeader({ title, href, actionLabel }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      {href && actionLabel && (
        <Link
          href={href}
          className="shrink-0 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    balance,
    pendingApprovals,
    monthlyTotal,
    recentExpenses,
    home,
    currentUserName,
    otherMemberName,
    loading: homeLoading,
  } = useHome(user?.id ?? null);
  const {
    totalPersonalDebt,
    direction: personalDebtDirection,
    loading: personalLoansLoading,
  } = usePersonalLoans(home?.id ?? null, user?.id ?? null);

  const loading = authLoading || homeLoading || personalLoansLoading;

  if (loading) {
    return <DashboardSkeleton />;
  }

  const balanceMessage = getBalanceMessage(balance.direction, otherMemberName);
  const personalDebtMessage = getPersonalDebtMessage(
    personalDebtDirection,
    otherMemberName
  );

  return (
    <div className="space-y-6 lg:space-y-8">
      {home && (
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-black text-foreground">
            {currentUserName === "Vos"
              ? "Hola 👋"
              : `Hola ${currentUserName} 👋`}
          </h1>
          <p className="mt-1 break-words text-sm text-muted-foreground">
            Resumen de {home.name} 💜
          </p>
        </div>
      )}

      <section
        aria-label="Resumen financiero"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <DashboardKpiCard
          label="Gastado este mes"
          value={formatCurrency(monthlyTotal)}
          supportingText="Gastos compartidos del mes"
          icon={<ReceiptText aria-hidden="true" className="h-5 w-5" />}
        />
        <DashboardKpiCard
          label="Balance compartido"
          value={formatCurrency(balance.amount)}
          supportingText={balanceMessage}
          icon={<Scale aria-hidden="true" className="h-5 w-5" />}
          variant="accent"
        />
        <DashboardKpiCard
          label="Deuda personal"
          value={formatCurrency(totalPersonalDebt)}
          supportingText={personalDebtMessage}
          icon={<HandCoins aria-hidden="true" className="h-5 w-5" />}
        />
        <DashboardKpiCard
          label="Pendientes"
          value={String(pendingApprovals.length)}
          supportingText="Por revisar"
          icon={<CheckCheck aria-hidden="true" className="h-5 w-5" />}
        />
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <section className={panelClassName}>
          <PanelHeader
            title="Gastos recientes"
            href="/expenses"
            actionLabel="Ver todos"
          />
          <div className="mt-4">
            <RecentExpensesList expenses={recentExpenses} />
          </div>
        </section>

        <div className="space-y-6">
          <section className={panelClassName}>
            <PanelHeader
              title="Pendiente de aprobación"
              href="/approvals"
              actionLabel="Ver todas"
            />
            <div className="mt-4">
              <PendingApprovalsList approvals={pendingApprovals} />
            </div>
          </section>

          <section className={panelClassName}>
            <PanelHeader title="Acciones rápidas" />
            <div className="mt-4">
              <QuickActions />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
