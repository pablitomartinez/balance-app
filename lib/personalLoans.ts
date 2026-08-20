import { supabase } from "@/lib/supabaseClient";

export type CreatePersonalLoanInput = {
  description: string;
  amount: number;
  loanDate: string;
};

export type RecordPersonalLoanPaymentInput = {
  loanId: string;
  amount: number;
  paymentDate: string;
  description?: string | null;
};

export async function createPersonalLoan(input: CreatePersonalLoanInput) {
  const { data, error } = await supabase.rpc("create_personal_loan", {
    p_description: input.description,
    p_amount: input.amount,
    p_loan_date: input.loanDate,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function recordPersonalLoanPayment(
  input: RecordPersonalLoanPaymentInput
) {
  const { data, error } = await supabase.rpc("record_personal_loan_payment", {
    p_loan_id: input.loanId,
    p_amount: input.amount,
    p_payment_date: input.paymentDate,
    p_description: input.description?.trim() || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
