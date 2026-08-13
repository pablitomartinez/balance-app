import { supabase } from "@/lib/supabaseClient";

export async function approveExpense(
  expenseId: string,
  comment?: string | null
) {
  if (!expenseId) {
    throw new Error("El gasto es obligatorio.");
  }

  const { error } = await supabase.rpc("approve_expense", {
    p_expense_id: expenseId,
    p_comment: comment ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function rejectExpense(
  expenseId: string,
  comment?: string | null
) {
  if (!expenseId) {
    throw new Error("El gasto es obligatorio.");
  }

  const { error } = await supabase.rpc("reject_expense", {
    p_expense_id: expenseId,
    p_comment: comment ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
}