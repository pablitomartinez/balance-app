import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import type { DashboardExpense } from "@/types/models";

type RecentExpensesListProps = {
  expenses: DashboardExpense[];
};

function formatExpenseDate(expenseDate: string) {
  const date = new Date(`${expenseDate}T12:00:00`);
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const startOfExpenseDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const dayDifference = Math.round(
    (startOfToday.getTime() - startOfExpenseDate.getTime()) / 86_400_000
  );

  if (dayDifference === 0) {
    return "Hoy";
  }

  if (dayDifference === 1) {
    return "Ayer";
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
  }).format(date);
}

// Lista de gastos recientes. No calcula saldos; solo presenta datos ya preparados.
export function RecentExpensesList({ expenses }: RecentExpensesListProps) {
  if (expenses.length === 0) {
    return (
      <EmptyState
        title="Gastos recientes"
        description="Cuando carguen movimientos compartidos van a aparecer acá."
      />
    );
  }

  return (
    <div className="divide-y divide-border rounded-md border border-border bg-card shadow-soft">
      {expenses.map((expense) => {
        const details = [
          `${expense.paidByName} pagó`,
          formatExpenseDate(expense.expenseDate),
          expense.categoryName,
        ].filter(Boolean);

        return (
          <article
            className="flex items-start justify-between gap-3 p-4"
            key={expense.id}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">
                {expense.description}
              </p>
              <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                {details.join(" · ")}
              </p>
            </div>
            <p className="shrink-0 whitespace-nowrap text-sm font-bold text-foreground">
              {formatCurrency(expense.amount)}
            </p>
          </article>
        );
      })}
    </div>
  );
}
