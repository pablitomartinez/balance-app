"use client";

import { ExpenseFormShell } from "@/components/expense/ExpenseFormShell";
import { Section } from "@/components/ui/Section";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { useHome } from "@/hooks/useHome";
import { ExpenseList } from "@/components/expense/ExpenseList";
import { useExpenses } from "@/hooks/useExpenses";

export default function ExpensesPage() {
  const { user, loading: authLoading } = useAuth();

  const {
    home,
    loading: homeLoading,
    error: homeError,
  } = useHome(user?.id ?? null);

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories(home?.id ?? null);

  const {
    expenses,
    loading: expensesLoading,
    error: expensesError,
    reload: reloadExpenses,
  } = useExpenses(home?.id ?? null);

  const loading = authLoading || homeLoading;

  if (loading) {
    return (
      <div className="mx-auto max-w-xl">
        <p className="text-sm text-muted-foreground">
          Cargando información del hogar...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl">
        <p className="text-sm text-muted-foreground">
          Necesitás iniciar sesión para registrar un gasto.
        </p>
      </div>
    );
  }

  if (!home) {
    return (
      <div className="mx-auto max-w-xl">
        <p className="text-sm text-muted-foreground">
          Todavía no tenés un hogar configurado.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">
          Nuevo gasto
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Registrá un gasto compartido del hogar.
        </p>
      </div>

      {(homeError || categoriesError) && (
        <p
          role="alert"
          className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {homeError || categoriesError}
        </p>
      )}

      <Section title="Datos del gasto">
        <ExpenseFormShell
          homeId={home.id}
          userId={user.id}
          categories={categories}
          categoriesLoading={categoriesLoading}
          onCreated={reloadExpenses}
        />
        <Section title="Gastos recientes">
          {expensesError ? (
            <p
              role="alert"
              className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {expensesError}
            </p>
          ) : (
            <ExpenseList
              expenses={expenses}
              loading={expensesLoading}
            />
          )}
        </Section>
      </Section>
    </div>
  );
}