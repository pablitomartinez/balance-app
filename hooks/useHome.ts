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

const CURRENT_USER_NAME_FALLBACK = "Vos";
const OTHER_MEMBER_NAME_FALLBACK = "La otra persona";

function getDisplayName(name: string | null | undefined, fallback: string) {
  return name?.trim() || fallback;
}

export function useHome(userId: string | null) {
  const [home, setHome] = useState<Home | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [otherMemberName, setOtherMemberName] = useState<string | null>(null);
  const [balance, setBalance] = useState(() =>
    calculateBalanceFromShares([], "")
  );
  const [monthlyTotal, setMonthlyTotal] = useState(0);
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
        setCurrentUserName(null);
        setOtherMemberName(null);
        setBalance(calculateBalanceFromShares([], ""));
        setRecentExpenses([]);
        setMonthlyTotal(0);
        setPendingApprovals([]);
        setHomeLoading(false);
        setError(null);
        return;
      }

      setError(null);
      setHome(null);
      setCurrentUserName(null);
      setOtherMemberName(null);
      setBalance(calculateBalanceFromShares([], userId));
      setRecentExpenses([]);
      setMonthlyTotal(0);
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
        homeMembersResult,
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
          .from("home_members")
          .select(`
            profile_id,
            profiles (
              full_name
            )
          `)
          .eq("home_id", currentHome.id),

        supabase
          .from("approvals")
          .select(`
            id,
            expense_id,
            expenses!inner (
              id,
              home_id,
              description,
              amount,
              paid_by
            )
          `)
          .eq("profile_id", userId)
          .eq("status", "pending")
          .eq("expenses.home_id", currentHome.id),
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

      if (homeMembersResult.error) {
        console.error(
          "Error cargando miembros del hogar:",
          homeMembersResult.error
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
      // 4. Miembros del hogar
      // ------------------------------------------------------------

      const homeMembers = homeMembersResult.data ?? [];
      const currentMember = homeMembers.find(
        (member) => member.profile_id === userId
      );
      const otherMember = homeMembers.find(
        (member) => member.profile_id !== userId
      );
      const currentProfile = currentMember?.profiles;
      const otherProfile = otherMember?.profiles;
      const currentMemberFullName = Array.isArray(currentProfile)
        ? currentProfile[0]?.full_name
        : currentProfile?.full_name;
      const otherMemberFullName = Array.isArray(otherProfile)
        ? otherProfile[0]?.full_name
        : otherProfile?.full_name;
      const dashboardCurrentUserName = getDisplayName(
        currentMemberFullName,
        CURRENT_USER_NAME_FALLBACK
      );
      const dashboardOtherMemberName = getDisplayName(
        otherMemberFullName,
        OTHER_MEMBER_NAME_FALLBACK
      );


      // ------------------------------------------------------------
      // 5. Resumen del mes
      // ------------------------------------------------------------

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      const currentMonthTotal = (approvedExpensesResult.data ?? [])
        .filter((expense) => {
          const expenseDate = new Date(`${expense.expense_date}T12:00:00`);

          return (
            expenseDate.getFullYear() === currentYear &&
            expenseDate.getMonth() === currentMonth
          );
        })
        .reduce((total, expense) => total + Number(expense.amount), 0);

      // ------------------------------------------------------------
      // 6. Gastos recientes
      // ------------------------------------------------------------

      const dashboardExpenses: DashboardExpense[] = (
        approvedExpensesResult.data ?? []
      )
        .slice(0, 5)
        .map((expense) => ({
          id: expense.id,
          description: expense.description,
          amount: Number(expense.amount),
          expenseDate: expense.expense_date,
          status: "approved",
          categoryName:
            Array.isArray(expense.categories) && expense.categories.length > 0
              ? expense.categories[0].name
              : null,
          paidBy: expense.paid_by,
          createdAt: expense.expense_date,
          paidByName:
            expense.paid_by === userId
              ? dashboardCurrentUserName
              : dashboardOtherMemberName,
        }));

      const dashboardPendingApprovals: PendingApproval[] = (
        pendingApprovalsResult.data ?? []
      ).flatMap((approval) => {
        const expense = Array.isArray(approval.expenses)
          ? approval.expenses[0]
          : approval.expenses;

        if (!expense) {
          return [];
        }

        const requesterName =
          expense.paid_by === userId
            ? dashboardCurrentUserName
            : dashboardOtherMemberName;

        return [
          {
            id: approval.id,
            approvalId: approval.id,
            expenseId: expense.id,
            title: expense.description,
            amount: Number(expense.amount),
            requesterId: expense.paid_by,
            requesterName,
            requestedByName: requesterName,
          },
        ];
      });

      // ------------------------------------------------------------
      // 7. Actualizar estado
      // ------------------------------------------------------------

      setHome(currentHome);
      setCurrentUserName(dashboardCurrentUserName);
      setOtherMemberName(dashboardOtherMemberName);
      setBalance(dashboardBalance);
      setMonthlyTotal(currentMonthTotal);
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
    monthlyTotal,
    recentExpenses,
    pendingApprovals,
    home,
    currentUserName,
    otherMemberName,
    hasHome: home !== null,
    error,
    loading: homeLoading,
  };
}
