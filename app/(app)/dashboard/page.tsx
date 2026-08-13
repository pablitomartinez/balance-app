"use client";

import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { PendingApprovalsList } from "@/components/dashboard/PendingApprovalsList";
import { RecentExpensesList } from "@/components/dashboard/RecentExpensesList";
import { Section } from "@/components/ui/Section";
import { useAuth } from "@/hooks/useAuth";
import { useHome } from "@/hooks/useHome";
import { InvitationTest } from "@/components/home/InvitationTest";

// Dashboard inicial. La pantalla muestra estructura real aunque los datos
// se conecten incrementalmente.
export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();

  const {
    balance,
    pendingApprovals,
    recentExpenses,
    home,
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
        <div>
          <h1 className="text-xl font-bold text-foreground">
            🏠 {home.name}
          </h1>
        </div>
      )}

      {home && <InvitationTest homeId={home.id} />}

      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
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