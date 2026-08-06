import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import type { DashboardExpense } from "@/types/models";

type RecentExpensesListProps = {
  expenses: DashboardExpense[];
};

// Lista de gastos recientes. No calcula saldos; solo presenta datos ya preparados.
export function RecentExpensesList({ expenses }: RecentExpensesListProps) {
  if (expenses.length === 0) {
    return (
      <EmptyState
        title="Todavía no hay gastos"
        description="Cuando carguen movimientos compartidos van a aparecer acá."
      />
    );
  }

  return (
    <div className="divide-y divide-border rounded-md border border-border bg-card">
      {expenses.map((expense) => (
        <article className="flex items-center justify-between gap-4 p-4" key={expense.id}>
          <div>
            <p className="font-semibold text-foreground">{expense.description}</p>
            <p className="mt-1 text-xs text-muted-foreground">Pagó {expense.paidByName}</p>
          </div>
          <p className="text-sm font-bold text-foreground">{formatCurrency(expense.amount)}</p>
        </article>
      ))}
    </div>
  );
}
