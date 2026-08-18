"use client";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { PendingApprovalsList } from "@/components/dashboard/PendingApprovalsList";
import { RecentExpensesList } from "@/components/dashboard/RecentExpensesList";
import { Section } from "@/components/ui/Section";
import { useAuth } from "@/hooks/useAuth";
import { useHome } from "@/hooks/useHome";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    balance,
    monthlyTotal,
    pendingApprovals,
    recentExpenses,
    home,
    currentUserName,
    otherMemberName,
    loading: homeLoading,
  } = useHome(user?.id ?? null);

  const loading = authLoading || homeLoading;

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Cargando información del hogar...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {home && (
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-black text-foreground">
            {currentUserName === "Vos" ? "Hola 👋" : `Hola, ${currentUserName} 👋`}
          </h1>
          <p className="mt-1 break-words text-sm text-muted-foreground">
            Así están las cuentas de {home.name}.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-md bg-card p-5 shadow-soft">
            <p className="text-sm font-semibold text-muted-foreground">
              Resumen del mes
            </p>

            <p className="mt-2 text-3xl font-black text-foreground">
              {formatCurrency(monthlyTotal)}
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Total gastado en gastos compartidos durante este mes.
            </p>
          </section>

          <BalanceCard
            balance={balance}
            otherMemberName={otherMemberName}
          />

          <Section title="Gastos recientes">
            <RecentExpensesList expenses={recentExpenses} />
          </Section>
        </div>

        <Section title="Pendiente de aprobación">
          <PendingApprovalsList approvals={pendingApprovals} />
        </Section>
      </div>
    </div>
  );
}
