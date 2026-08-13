"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ExpenseCategory } from "@/hooks/useCategories";
import {
  createExpense,
  type CreateExpenseInput,
} from "@/lib/expenses";

type ExpenseFormShellProps = {
  homeId: string;
  userId: string;
  categories: ExpenseCategory[];
  categoriesLoading?: boolean;
  onCreated?: () => void;
};

const PAYMENT_METHODS: {
  value: CreateExpenseInput["paymentMethod"];
  label: string;
}[] = [
  { value: "cash", label: "Efectivo" },
  { value: "debit", label: "Débito" },
  { value: "credit", label: "Crédito" },
  { value: "transfer", label: "Transferencia" },
  { value: "mercadopago", label: "Mercado Pago" },
  { value: "other", label: "Otro" },
];

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export function ExpenseFormShell({
  homeId,
  userId,
  categories,
  categoriesLoading = false,
  onCreated,
}: ExpenseFormShellProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(getToday());
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<CreateExpenseInput["paymentMethod"]>("other");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setSuccess(false);

    const normalizedAmount = Number(amount);

    if (!description.trim()) {
      setError("Ingresá una descripción.");
      return;
    }

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      setError("Ingresá un monto válido.");
      return;
    }

    if (!expenseDate) {
      setError("Seleccioná una fecha.");
      return;
    }

    setSaving(true);

    try {
      await createExpense({
        homeId,
        description: description.trim(),
        amount: normalizedAmount,
        expenseDate,
        categoryId: categoryId || null,
        paymentMethod,
        paidBy: userId,
      });

      setDescription("");
      setAmount("");
      setExpenseDate(getToday());
      setCategoryId("");
      setPaymentMethod("other");

      setSuccess(true);
      onCreated?.();
    } catch (error) {
      console.error("Error creating expense:", error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo crear el gasto."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-md border border-border bg-card p-4"
    >
      <label className="block">
        <span className="text-sm font-semibold text-foreground">
          Descripción
        </span>

        <input
          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring"
          placeholder="Supermercado"
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={saving}
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-foreground">
          Monto
        </span>

        <input
          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring"
          placeholder="0"
          type="number"
          min="0.01"
          step="0.01"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          disabled={saving}
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-foreground">
          Fecha
        </span>

        <input
          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring"
          type="date"
          value={expenseDate}
          onChange={(event) => setExpenseDate(event.target.value)}
          disabled={saving}
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-foreground">
          Categoría
        </span>

        <select
          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          disabled={saving || categoriesLoading}
        >
          <option value="">
            {categoriesLoading
              ? "Cargando categorías..."
              : "Sin categoría"}
          </option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-foreground">
          Método de pago
        </span>

        <select
          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring"
          value={paymentMethod}
          onChange={(event) =>
            setPaymentMethod(
              event.target.value as CreateExpenseInput["paymentMethod"]
            )
          }
          disabled={saving}
        >
          {PAYMENT_METHODS.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground"
        >
          Gasto creado correctamente.
        </p>
      )}

      <Button
        className="w-full"
        disabled={saving || !homeId || !userId}
        type="submit"
      >
        {saving ? "Guardando..." : "Crear gasto"}
      </Button>
    </form>
  );
}