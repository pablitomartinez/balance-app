"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type ExpensePaymentMethod =
  | "cash"
  | "debit"
  | "credit"
  | "transfer"
  | "mercadopago"
  | "other";

export type ExpenseStatus =
  | "pending"
  | "approved"
  | "rejected";

export type ExpenseListItem = {
  id: string;
  description: string;
  amount: number;
  expenseDate: string;
  paymentMethod: ExpensePaymentMethod;
  status: ExpenseStatus;
  categoryId: string | null;
  categoryName: string | null;
};

const PAYMENT_METHODS: ExpensePaymentMethod[] = [
  "cash",
  "debit",
  "credit",
  "transfer",
  "mercadopago",
  "other",
];

const EXPENSE_STATUSES: ExpenseStatus[] = [
  "pending",
  "approved",
  "rejected",
];

function isPaymentMethod(value: string): value is ExpensePaymentMethod {
  return PAYMENT_METHODS.includes(value as ExpensePaymentMethod);
}

function isExpenseStatus(value: string): value is ExpenseStatus {
  return EXPENSE_STATUSES.includes(value as ExpenseStatus);
}

export function useExpenses(homeId: string | null) {
  const [expenses, setExpenses] = useState<ExpenseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExpenses = useCallback(async () => {
    if (!homeId) {
      setExpenses([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: expensesError } = await supabase
      .from("expenses")
      .select(`
        id,
        description,
        amount,
        expense_date,
        payment_method,
        status,
        category_id,
        categories (
          name
        )
      `)
      .eq("home_id", homeId)
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (expensesError) {
      setExpenses([]);
      setError("No se pudieron cargar los gastos.");
      setLoading(false);
      return;
    }

    const normalizedExpenses: ExpenseListItem[] = [];

    for (const expense of data ?? []) {
      if (!isPaymentMethod(expense.payment_method)) {
        console.error(
          "Método de pago inválido recibido desde Supabase:",
          expense.payment_method
        );
        continue;
      }

      if (!isExpenseStatus(expense.status)) {
        console.error(
          "Estado de gasto inválido recibido desde Supabase:",
          expense.status
        );
        continue;
      }

      normalizedExpenses.push({
        id: expense.id,
        description: expense.description,
        amount: Number(expense.amount),
        expenseDate: expense.expense_date,
        paymentMethod: expense.payment_method,
        status: expense.status,
        categoryId: expense.category_id,
        categoryName:
          Array.isArray(expense.categories) &&
          expense.categories.length > 0
            ? expense.categories[0].name
            : null,
      });
    }

    setExpenses(normalizedExpenses);
    setLoading(false);
  }, [homeId]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  return {
    expenses,
    loading,
    error,
    reload: loadExpenses,
  };
}