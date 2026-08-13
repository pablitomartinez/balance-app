"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { approveExpense, rejectExpense } from "@/lib/approvals";

export type ApprovalItem = {
  id: string;
  expenseId: string;
  description: string;
  amount: number;
  expenseDate: string;
  paymentMethod: string;
  status: "pending" | "approved" | "rejected";
  paidBy: string;
};

export function useApprovals(userId: string | null, homeId: string | null) {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadApprovals = useCallback(async () => {
    if (!userId || !homeId) {
      setApprovals([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error: approvalsError } = await supabase
      .from("approvals")
      .select(`
        id,
        expense_id,
        profile_id,
        status,
        expenses (
          id,
          home_id,
          description,
          amount,
          expense_date,
          payment_method,
          paid_by
        )
      `)
      .eq("profile_id", userId)
      .eq("status", "pending");

    if (approvalsError) {
      setApprovals([]);
      setError("No se pudieron cargar las aprobaciones.");
      setLoading(false);
      return;
    }

    const normalizedApprovals: ApprovalItem[] = [];

    for (const approval of data ?? []) {
      const expense = Array.isArray(approval.expenses)
        ? approval.expenses[0]
        : approval.expenses;

      if (!expense) {
        continue;
      }

      if (expense.home_id !== homeId) {
        continue;
      }

      normalizedApprovals.push({
        id: approval.id,
        expenseId: expense.id,
        description: expense.description,
        amount: Number(expense.amount),
        expenseDate: expense.expense_date,
        paymentMethod: expense.payment_method,
        status:
          approval.status === "approved" ||
          approval.status === "rejected"
            ? approval.status
            : "pending",
        paidBy: expense.paid_by,
      });
    }

    setApprovals(normalizedApprovals);
    setLoading(false);
  }, [userId, homeId]);

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  const approve = useCallback(
    async (expenseId: string) => {
      setActionLoading(expenseId);
      setError(null);

      try {
        await approveExpense(expenseId);
        await loadApprovals();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No se pudo aprobar el gasto."
        );
      } finally {
        setActionLoading(null);
      }
    },
    [loadApprovals]
  );

  const reject = useCallback(
    async (expenseId: string, comment?: string) => {
      setActionLoading(expenseId);
      setError(null);

      try {
        await rejectExpense(expenseId, comment);
        await loadApprovals();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No se pudo rechazar el gasto."
        );
      } finally {
        setActionLoading(null);
      }
    },
    [loadApprovals]
  );

  return {
    approvals,
    loading,
    error,
    actionLoading,
    approve,
    reject,
    reload: loadApprovals,
  };
}