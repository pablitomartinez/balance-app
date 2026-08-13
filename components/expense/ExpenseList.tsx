"use client";

import type { ExpenseListItem } from "@/hooks/useExpenses";
import { formatCurrency } from "@/lib/utils";

type ExpenseListProps = {
  expenses: ExpenseListItem[];
  loading?: boolean;
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

export function ExpenseList({
  expenses,
  loading = false,
}: ExpenseListProps) {
  if (loading) {
    return (
      <div className="rounded-md border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Cargando gastos...
        </p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-md border border-border bg-card p-6 text-center">
        <p className="text-sm font-semibold text-foreground">
          Todavía no hay gastos
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Los gastos que registres aparecerán acá.
        </p>
      </div>
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
        className="rounded-md border border-border bg-card p-4"
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

          <p className="shrink-0 text-sm font-bold text-foreground">
            {formatCurrency(expense.amount)}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {isToday(expense.expenseDate)
              ? "Hoy"
              : formatDate(expense.expenseDate)}
          </span>

          {expense.status === "pending" && (
            <span className="text-xs font-medium text-muted-foreground">
              Pendiente
            </span>
          )}
        </div>
      </article>
    );
  }

  return (
    <div className="space-y-6">
      {todayExpenses.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold text-foreground">
            Hoy
          </h2>

          <div className="space-y-2">
            {todayExpenses.map(renderExpense)}
          </div>
        </section>
      )}

      {weekExpenses.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold text-foreground">
            Esta semana
          </h2>

          <div className="space-y-2">
            {weekExpenses.map(renderExpense)}
          </div>
        </section>
      )}

      {olderExpenses.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold text-foreground">
            Anteriores
          </h2>

          <div className="space-y-2">
            {olderExpenses.map(renderExpense)}
          </div>
        </section>
      )}
    </div>
  );
}
