"use client";

import type { ReactNode } from "react";
import type { ExpenseListItem } from "@/hooks/useExpenses";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";

type ExpenseListProps = {
  expenses: ExpenseListItem[];
  loading?: boolean;
  emptyAction?: ReactNode;
};

const PAYMENT_METHOD_LABELS: Record<
  ExpenseListItem["paymentMethod"],
  string
> = {
  cash: "Efectivo",
  debit: "Débito",
  credit: "Crédito",
  transfer: "Transferencia",
  mercadopago: "Mercado Pago",
  other: "Otro",
};

function formatDate(date: string) {
  const parsedDate = new Date(`${date}T12:00:00`);

  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
  }).format(parsedDate);
}

function isToday(date: string) {
  const today = new Date();

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return date === todayString;
}

function isThisWeek(date: string) {
  const parsedDate = new Date(`${date}T12:00:00`);
  const today = new Date();

  const day = today.getDay();
  const differenceFromMonday = day === 0 ? 6 : day - 1;

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - differenceFromMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  return parsedDate >= startOfWeek && !isToday(date);
}

function getStatusLabel(status: ExpenseListItem["status"]) {
  switch (status) {
    case "pending":
      return "Pendiente";

    case "approved":
      return "Aprobado";

    case "rejected":
      return "Rechazado";
  }
}

function getStatusClassName(status: ExpenseListItem["status"]) {
  switch (status) {
    case "pending":
      return "border-warning/30 bg-warning/10 text-warning";

    case "approved":
      return "border-success/30 bg-success/10 text-success";

    case "rejected":
      return "border-destructive/30 bg-destructive/10 text-destructive";
  }
}

function ExpenseSkeleton() {
  return (
    <article className="rounded-md border border-border bg-card p-4 lg:grid lg:grid-cols-[minmax(0,1fr)_7rem_8rem_8rem] lg:items-center lg:gap-4 lg:rounded-none lg:border-x-0 lg:border-t-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>

        <Skeleton className="h-5 w-20 shrink-0 lg:hidden" />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 lg:mt-0 lg:contents">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="hidden h-5 w-20 justify-self-end lg:block" />
      </div>
    </article>
  );
}

export function ExpenseList({
  expenses,
  loading = false,
  emptyAction,
}: ExpenseListProps) {
  if (loading) {
    return (
      <div className="space-y-3 lg:overflow-hidden lg:rounded-lg lg:border lg:border-border lg:bg-card lg:space-y-0">
        <ExpenseSkeleton />
        <ExpenseSkeleton />
        <ExpenseSkeleton />
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <EmptyState
        title="Todavía no hay gastos"
        description="Los gastos que registres aparecerán acá."
        action={emptyAction}
      />
    );
  }

  const todayExpenses = expenses.filter((expense) =>
    isToday(expense.expenseDate)
  );

  const weekExpenses = expenses.filter(
    (expense) =>
      isThisWeek(expense.expenseDate) &&
      !isToday(expense.expenseDate)
  );

  const olderExpenses = expenses.filter(
    (expense) =>
      !isToday(expense.expenseDate) &&
      !isThisWeek(expense.expenseDate)
  );

  function renderExpense(expense: ExpenseListItem) {
    return (
      <article
        key={expense.id}
        className="rounded-md border border-border bg-card p-4 transition lg:grid lg:grid-cols-[minmax(0,1fr)_7rem_8rem_8rem] lg:items-center lg:gap-4 lg:rounded-none lg:border-x-0 lg:border-t-0 lg:hover:bg-muted/40 lg:last:border-b-0"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground">
              {expense.description}
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              {expense.categoryName ?? "Sin categoría"} ·{" "}
              {PAYMENT_METHOD_LABELS[expense.paymentMethod]}
            </p>
          </div>

          <p className="shrink-0 text-sm font-bold text-foreground lg:hidden">
            {formatCurrency(expense.amount)}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 lg:mt-0 lg:contents">
          <span className="text-xs text-muted-foreground">
            {isToday(expense.expenseDate)
              ? "Hoy"
              : formatDate(expense.expenseDate)}
          </span>

          <span
            className={`w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClassName(
              expense.status
            )}`}
          >
            {getStatusLabel(expense.status)}
          </span>

          <p className="hidden justify-self-end whitespace-nowrap text-sm font-bold text-foreground lg:block">
            {formatCurrency(expense.amount)}
          </p>
        </div>
      </article>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-5">
      {todayExpenses.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold text-foreground">
            Hoy
          </h2>

          <div className="space-y-2 lg:overflow-hidden lg:rounded-lg lg:border lg:border-border lg:bg-card lg:space-y-0">
            {todayExpenses.map(renderExpense)}
          </div>
        </section>
      )}

      {weekExpenses.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold text-foreground">
            Esta semana
          </h2>

          <div className="space-y-2 lg:overflow-hidden lg:rounded-lg lg:border lg:border-border lg:bg-card lg:space-y-0">
            {weekExpenses.map(renderExpense)}
          </div>
        </section>
      )}

      {olderExpenses.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold text-foreground">
            Anteriores
          </h2>

          <div className="space-y-2 lg:overflow-hidden lg:rounded-lg lg:border lg:border-border lg:bg-card lg:space-y-0">
            {olderExpenses.map(renderExpense)}
          </div>
        </section>
      )}
    </div>
  );
}
