"use client";

import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { PendingApprovalsList } from "@/components/dashboard/PendingApprovalsList";
import { RecentExpensesList } from "@/components/dashboard/RecentExpensesList";
import { Section } from "@/components/ui/Section";
import { useHome } from "@/hooks/useHome";

// Dashboard inicial. La pantalla muestra estructura real aunque los datos se conecten incrementalmente.
export default function DashboardPage() {
  const {
    balance,
    pendingApprovals,
    recentExpenses,
    home,
    loading,
  } = useHome();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-finance-muted">Cargando...</p>
      </main>
    );
  }

  return (
    <div className="space-y-6">
      {home && (
        <Section title="Mi hogar">
          <p className="text-2xl font-bold text-finance-ink">
            🏠 {home.name}
          </p>
        </Section>
      )}

      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
        {/* <pre>{JSON.stringify(home, null, 2)}</pre> */}
          <BalanceCard balance={balance} />

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