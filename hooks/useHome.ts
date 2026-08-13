"use client";

import { useEffect, useState } from "react";
import {
  calculateBalanceFromShares,
  type ExpenseShareForBalance,
} from "@/lib/calculations";
import { supabase } from "@/lib/supabaseClient";
import type { DashboardExpense, PendingApproval } from "@/types/models";

type Home = {
  id: string;
  name: string;
};

export function useHome(userId: string | null) {
  const [home, setHome] = useState<Home | null>(null);

  const [balance, setBalance] = useState(() =>
    calculateBalanceFromShares([], "")
  );

  const [recentExpenses, setRecentExpenses] = useState<DashboardExpense[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>(
    []
  );

  const [homeLoading, setHomeLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadHome() {
      if (!userId) {
        if (!active) return;

        setHome(null);
        setBalance(calculateBalanceFromShares([], ""));
        setRecentExpenses([]);
        setPendingApprovals([]);
        setHomeLoading(false);
        setError(null);

        return;
      }

      setError(null);
      setHome(null);
      setBalance(calculateBalanceFromShares([], userId));
      setRecentExpenses([]);
      setPendingApprovals([]);
      setHomeLoading(true);

      // ------------------------------------------------------------
      // 1. Obtener el home del usuario
      // ------------------------------------------------------------

      const {
        data: membership,
        error: membershipError,
      } = await supabase
        .from("home_members")
        .select("home_id")
        .eq("profile_id", userId)
        .maybeSingle();

      if (!active) return;

      if (membershipError) {
        setError("No se pudo cargar la información del hogar.");
        setHome(null);
        setHomeLoading(false);
        return;
      }

      if (!membership) {
        setHome(null);
        setHomeLoading(false);
        return;
      }

      const {
        data: homeData,
        error: homeError,
      } = await supabase
        .from("homes")
        .select("id, name")
        .eq("id", membership.home_id)
        .single();

      if (!active) return;

      if (homeError) {
        setError("No se pudo cargar la información del hogar.");
        setHome(null);
        setHomeLoading(false);
        return;
      }

      const currentHome = homeData;

      // ------------------------------------------------------------
      // 2. Cargar datos del Dashboard
      // ------------------------------------------------------------

      const [
        approvedExpensesResult,
        approvedSharesResult,
        pendingApprovalsResult,
      ] = await Promise.all([
        supabase
          .from("expenses")
          .select(`
            id,
            description,
            amount,
            expense_date,
            paid_by,
            categories (
              name
            )
          `)
          .eq("home_id", currentHome.id)
          .eq("status", "approved")
          .order("expense_date", { ascending: false })
          .order("created_at", { ascending: false }),

        supabase
          .from("expense_shares")
          .select(`
            expense_id,
            profile_id,
            expected_amount,
            actual_amount,
            expenses!inner (
              home_id,
              status
            )
          `)
          .eq("expenses.home_id", currentHome.id)
          .eq("expenses.status", "approved"),

        supabase
          .from("approvals")
          .select(`
            id,
            expense_id,
            profile_id,
            status
          `)
          .eq("status", "pending"),
      ]);

      if (!active) return;

      if (approvedExpensesResult.error) {
        console.error(
          "Error cargando gastos aprobados:",
          approvedExpensesResult.error
        );
      }

      if (approvedSharesResult.error) {
        console.error(
          "Error cargando shares:",
          approvedSharesResult.error
        );
      }

      if (pendingApprovalsResult.error) {
        console.error(
          "Error cargando aprobaciones pendientes:",
          pendingApprovalsResult.error
        );
      }

      // ------------------------------------------------------------
      // 3. Balance
      // ------------------------------------------------------------

      const balanceShares: ExpenseShareForBalance[] = (
        approvedSharesResult.data ?? []
      ).map((share) => ({
        profileId: share.profile_id,
        expectedAmount: Number(share.expected_amount),
        actualAmount: Number(share.actual_amount),
      }));

      const dashboardBalance = calculateBalanceFromShares(
        balanceShares,
        userId
      );

      // ------------------------------------------------------------
      // 4. Gastos recientes
      // ------------------------------------------------------------

      const dashboardExpenses: DashboardExpense[] = (
        approvedExpensesResult.data ?? []
      )
        .slice(0, 5)
        .map((expense) => ({
          id: expense.id,
          description: expense.description,
          amount: Number(expense.amount),
          createdAt: expense.expense_date,
          paidByName:
            expense.paid_by === userId
              ? "Vos"
              : "La otra persona",
        }));

      // ------------------------------------------------------------
      // 5. Pendientes de aprobación
      // ------------------------------------------------------------

      const pendingExpenseIds = new Set(
        (pendingApprovalsResult.data ?? []).map(
          (approval) => approval.expense_id
        )
      );

      let dashboardPendingApprovals: PendingApproval[] = [];

      if (pendingExpenseIds.size > 0) {
        const { data: pendingExpenses, error: pendingExpensesError } =
          await supabase
            .from("expenses")
            .select(`
              id,
              description,
              amount,
              paid_by
            `)
            .eq("home_id", currentHome.id)
            .eq("status", "pending")
            .in("id", Array.from(pendingExpenseIds));

        if (pendingExpensesError) {
          console.error(
            "Error cargando gastos pendientes:",
            pendingExpensesError
          );
        } else {
          dashboardPendingApprovals = (pendingExpenses ?? []).map(
            (expense) => ({
              id: expense.id,
              title: expense.description,
              amount: Number(expense.amount),
              requestedByName:
                expense.paid_by === userId
                  ? "Vos"
                  : "La otra persona",
            })
          );
        }
      }

      // ------------------------------------------------------------
      // 6. Actualizar estado
      // ------------------------------------------------------------

      setHome(currentHome);
      setBalance(dashboardBalance);
      setRecentExpenses(dashboardExpenses);
      setPendingApprovals(dashboardPendingApprovals);
      setHomeLoading(false);
    }

    loadHome();

    return () => {
      active = false;
    };
  }, [userId]);

  return {
    balance,
    recentExpenses,
    pendingApprovals,
    home,
    hasHome: home !== null,
    error,
    loading: homeLoading,
  };
}