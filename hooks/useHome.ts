"use client";

import { useMemo } from "react";
import { calculateNetBalance } from "@/lib/calculations";
import type { DashboardExpense, PendingApproval } from "@/types/models";

// Este hook será el punto de entrada para cargar hogar, gastos, aprobaciones y transferencias.
// En este primer incremento devuelve una estructura vacía para montar el dashboard sin mezclar UI y datos.
export function useHome() {
  const balance = useMemo(() => calculateNetBalance([], "current-user", "other-user"), []);

  const recentExpenses: DashboardExpense[] = [];
  const pendingApprovals: PendingApproval[] = [];

  return {
    balance,
    recentExpenses,
    pendingApprovals,
    loading: false
  };
}
