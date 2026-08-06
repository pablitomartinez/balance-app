import { Button } from "@/components/ui/Button";

// Formulario visual inicial para gastos. La persistencia se agregará en el siguiente incremento.
export function ExpenseFormShell() {
  return (
    <form className="space-y-4 rounded-md border border-border bg-card p-4">
      <label className="block">
        <span className="text-sm font-semibold text-foreground">Descripción</span>
        <input
          className="mt-2 w-full rounded-md border border-input px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring"
          placeholder="Supermercado"
          type="text"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-foreground">Monto</span>
        <input
          className="mt-2 w-full rounded-md border border-input px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring"
          placeholder="0"
          type="number"
        />
      </label>
      <Button className="w-full" disabled type="button">
        Crear gasto
      </Button>
    </form>
  );
}
