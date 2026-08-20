"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { createPersonalLoan } from "@/lib/personalLoans";

type PersonalLoanFormProps = {
  otherMemberName: string | null;
  onCreated: () => void;
};

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export function PersonalLoanForm({
  otherMemberName,
  onCreated,
}: PersonalLoanFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [loanDate, setLoanDate] = useState(getToday());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const normalizedAmount = Number(amount);

    if (!description.trim()) {
      setError("Ingresá un concepto.");
      return;
    }

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      setError("Ingresá un monto válido.");
      return;
    }

    if (!loanDate) {
      setError("Seleccioná una fecha.");
      return;
    }

    setSaving(true);

    try {
      await createPersonalLoan({
        description: description.trim(),
        amount: normalizedAmount,
        loanDate,
      });

      setDescription("");
      setAmount("");
      setLoanDate(getToday());
      setSuccess(true);
      onCreated();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "No se pudo registrar el préstamo."
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
      <p className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
        Le prestás a <strong className="text-foreground">{otherMemberName ?? "la otra persona"}</strong>.
      </p>

      <label className="block">
        <span className="text-sm font-semibold text-foreground">Concepto</span>
        <input
          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring"
          placeholder="Cubiertas"
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={saving}
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-foreground">Monto</span>
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
        <span className="text-sm font-semibold text-foreground">Fecha</span>
        <input
          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring"
          type="date"
          value={loanDate}
          onChange={(event) => setLoanDate(event.target.value)}
          disabled={saving}
        />
      </label>

      {error && <p role="alert" className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}
      {success && <p role="status" className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">Préstamo registrado correctamente.</p>}

      <Button className="w-full" disabled={saving} type="submit">
        {saving ? "Guardando..." : "Registrar préstamo"}
      </Button>
    </form>
  );
}
