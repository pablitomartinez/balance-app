"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type PersonalLoanStatus = "open" | "paid" | "cancelled";
export type PersonalDebtDirection =
  | "current_user_owes"
  | "other_user_owes"
  | "even";

export type PersonalLoanListItem = {
  id: string;
  description: string;
  principalAmount: number;
  loanDate: string;
  status: PersonalLoanStatus;
  lenderId: string;
  borrowerId: string;
  lenderName: string;
  borrowerName: string;
  totalPaid: number;
  remainingAmount: number;
};

function getDisplayName(name: string | null | undefined, fallback: string) {
  return name?.trim() || fallback;
}

function isPersonalLoanStatus(value: string): value is PersonalLoanStatus {
  return value === "open" || value === "paid" || value === "cancelled";
}

export function usePersonalLoans(
  homeId: string | null,
  currentUserId: string | null
) {
  const [loans, setLoans] = useState<PersonalLoanListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLoans = useCallback(async () => {
    if (!homeId || !currentUserId) {
      setLoans([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const { data: loanRows, error: loansError } = await supabase
      .from("personal_loans")
      .select(
        "id, description, principal_amount, loan_date, status, lender_profile_id, borrower_profile_id"
      )
      .eq("home_id", homeId)
      .order("loan_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (loansError) {
      setLoans([]);
      setError("No se pudieron cargar los préstamos personales.");
      setLoading(false);
      return;
    }

    const loanIds = (loanRows ?? []).map((loan) => loan.id);
    const profileIds = Array.from(
      new Set(
        (loanRows ?? []).flatMap((loan) => [
          loan.lender_profile_id,
          loan.borrower_profile_id,
        ])
      )
    );

    const [paymentsResult, profilesResult] = await Promise.all([
      loanIds.length > 0
        ? supabase
            .from("personal_loan_payments")
            .select("loan_id, amount")
            .eq("home_id", homeId)
            .in("loan_id", loanIds)
        : Promise.resolve({ data: [], error: null }),
      profileIds.length > 0
        ? supabase.from("profiles").select("id, full_name").in("id", profileIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (paymentsResult.error || profilesResult.error) {
      setLoans([]);
      setError("No se pudieron cargar los saldos de los préstamos.");
      setLoading(false);
      return;
    }

    const totalPaidByLoan = new Map<string, number>();
    for (const payment of paymentsResult.data ?? []) {
      totalPaidByLoan.set(
        payment.loan_id,
        (totalPaidByLoan.get(payment.loan_id) ?? 0) + Number(payment.amount)
      );
    }

    const profileNameById = new Map<string, string>();
    for (const profile of profilesResult.data ?? []) {
      profileNameById.set(profile.id, getDisplayName(profile.full_name, "Sin nombre"));
    }

    const normalizedLoans: PersonalLoanListItem[] = (loanRows ?? []).flatMap(
      (loan) => {
        if (!isPersonalLoanStatus(loan.status)) {
          console.error("Estado de préstamo inválido recibido:", loan.status);
          return [];
        }

        const principalAmount = Number(loan.principal_amount);
        const totalPaid = totalPaidByLoan.get(loan.id) ?? 0;

        return [
          {
            id: loan.id,
            description: loan.description,
            principalAmount,
            loanDate: loan.loan_date,
            status: loan.status,
            lenderId: loan.lender_profile_id,
            borrowerId: loan.borrower_profile_id,
            lenderName: getDisplayName(
              profileNameById.get(loan.lender_profile_id),
              loan.lender_profile_id === currentUserId ? "Vos" : "La otra persona"
            ),
            borrowerName: getDisplayName(
              profileNameById.get(loan.borrower_profile_id),
              loan.borrower_profile_id === currentUserId ? "Vos" : "La otra persona"
            ),
            totalPaid,
            remainingAmount: Math.max(0, principalAmount - totalPaid),
          },
        ];
      }
    );

    setLoans(normalizedLoans);
    setLoading(false);
  }, [currentUserId, homeId]);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  const netAmount = loans.reduce((total, loan) => {
    if (loan.status !== "open" || loan.remainingAmount <= 0) {
      return total;
    }

    if (loan.lenderId === currentUserId) {
      return total + loan.remainingAmount;
    }

    if (loan.borrowerId === currentUserId) {
      return total - loan.remainingAmount;
    }

    return total;
  }, 0);

  const totalPersonalDebt = Math.abs(netAmount);
  const direction: PersonalDebtDirection =
    Math.abs(netAmount) < 0.01
      ? "even"
      : netAmount > 0
        ? "other_user_owes"
        : "current_user_owes";

  return {
    loans,
    loading,
    error,
    reload: loadLoans,
    totalPersonalDebt,
    direction,
  };
}
