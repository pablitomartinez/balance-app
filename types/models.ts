// Este archivo concentra modelos usados por la UI sin modificar el esquema de base de datos.

export type BalanceDirection = "even" | "first_owes_second" | "second_owes_first";

export type BalanceSummary = {
  amount: number;
  direction: BalanceDirection;
  label: string;
};

export type DashboardExpense = {
  id: string;
  description: string;
  amount: number;
  createdAt: string;
  paidByName: string;
};

export type PendingApproval = {
  id: string;
  title: string;
  amount: number;
  requestedByName: string;
};
