"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ExpenseFormShell } from "@/components/expense/ExpenseFormShell";
import { ExpenseList } from "@/components/expense/ExpenseList";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { useHome } from "@/hooks/useHome";
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

  const [showForm, setShowForm] = useState(false);

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

  function handleExpenseCreated() {
    reloadExpenses();
    setShowForm(false);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 lg:max-w-none lg:space-y-8">
      {/* ---------------------------------------------------------- */}
      {/* Header */}
      {/* ---------------------------------------------------------- */}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-black text-foreground">
            Gastos
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Todos los movimientos compartidos de {home.name}.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setShowForm((current) => !current)}
          className="shrink-0 gap-2"
        >
          {!showForm && <Plus aria-hidden="true" className="hidden h-4 w-4 lg:block" />}
          {showForm ? (
            "Cerrar"
          ) : (
            <>
              <span className="lg:hidden">+ Nuevo gasto</span>
              <span className="hidden lg:inline">Registrar gasto</span>
            </>
          )}
        </Button>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Errors generales */}
      {/* ---------------------------------------------------------- */}

      {(homeError || categoriesError) && (
        <p
          role="alert"
          className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {homeError || categoriesError}
        </p>
      )}

      {/* ---------------------------------------------------------- */}
      {/* Formulario expandible */}
      {/* ---------------------------------------------------------- */}

      <div
        className={[
          "grid transition-all duration-300 ease-out",
          showForm
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="min-h-0 overflow-hidden lg:max-w-2xl">
          <Section title="Nuevo gasto">
            <div className="pt-1">
              <ExpenseFormShell
                homeId={home.id}
                userId={user.id}
                categories={categories}
                categoriesLoading={categoriesLoading}
                onCreated={handleExpenseCreated}
              />
            </div>
          </Section>
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/* Lista de gastos */}
      {/* ---------------------------------------------------------- */}

      <section className="space-y-3 lg:rounded-xl lg:border lg:border-border lg:bg-card lg:p-5 lg:shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-foreground">
            <span className="lg:hidden">Gastos recientes</span>
            <span className="hidden lg:inline">Gastos compartidos</span>
          </h2>
        </div>
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
            emptyAction={
              <Button type="button" onClick={() => setShowForm(true)}>
                Registrar el primer gasto
              </Button>
            }
          />
        )}
      </section>
    </div>
  );
}
