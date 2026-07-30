import { ExpenseFormShell } from "@/components/expense/ExpenseFormShell";
import { Section } from "@/components/ui/Section";

// Pantalla inicial de gastos. La creación real se conectará con Supabase en el siguiente paso.
export default function ExpensesPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-finance-ink">Nuevo gasto</h1>
        <p className="mt-2 text-sm leading-6 text-finance-muted">
          Cada gasto compartido genera una aprobación de la otra persona.
        </p>
      </div>
      <Section title="Datos del gasto">
        <ExpenseFormShell />
      </Section>
    </div>
  );
}
