import { supabase } from "@/lib/supabaseClient";

export type CreateExpenseInput = {
  homeId: string;
  description: string;
  amount: number;
  expenseDate: string;
  categoryId: string | null;
  paymentMethod:
    | "cash"
    | "debit"
    | "credit"
    | "transfer"
    | "mercadopago"
    | "other";
  paidBy: string;
};


export async function createExpense(input: CreateExpenseInput) {

  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  const { data, error } = await supabase.rpc("create_expense", {
    p_home_id: input.homeId,
    p_description: input.description,
    p_amount: input.amount,
    p_expense_date: input.expenseDate,
    p_paid_by: input.paidBy,
    p_payment_method: input.paymentMethod,
    p_category_id: input.categoryId,
    p_service_id: null,
    p_notes: null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}