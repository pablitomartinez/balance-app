"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { recordPersonalLoanPayment } from "@/lib/personalLoans";
import { formatCurrency } from "@/lib/utils";

type PersonalLoanPaymentFormProps = {
  loanId: string;
  remainingAmount: number;
  onRecorded: () => void;
  onCancel: () => void;
};

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export function PersonalLoanPaymentForm({
  loanId,
  remainingAmount,
  onRecorded,
  onCancel,
}: PersonalLoanPaymentFormProps) {
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(getToday());
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const normalizedAmount = Number(amount);

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      setError("Ingresá un monto válido.");
      return;
    }

    if (normalizedAmount > remainingAmount) {
      setError("El pago no puede superar el saldo pendiente.");
      return;
    }

    if (!paymentDate) {
      setError("Seleccioná una fecha.");
      return;
    }

    setSaving(true);
    try {
      await recordPersonalLoanPayment({
        loanId,
        amount: normalizedAmount,
        paymentDate,
        description,
      });
      onRecorded();
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo registrar el pago.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-md border border-border bg-muted p-3">
      <p className="text-sm font-semibold text-foreground">Saldo pendiente: {formatCurrency(remainingAmount)}</p>
      <label className="block">
        <span className="text-xs font-semibold text-muted-foreground">Monto del pago</span>
        <input className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring" type="number" min="0.01" max={remainingAmount} step="0.01" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} disabled={saving} />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-muted-foreground">Fecha</span>
        <input className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring" type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} disabled={saving} />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-muted-foreground">Nota opcional</span>
        <input className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring" type="text" value={description} onChange={(event) => setDescription(event.target.value)} disabled={saving} />
      </label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel} disabled={saving}>Cancelar</Button>
        <Button type="submit" className="flex-1" disabled={saving}>{saving ? "Guardando..." : "Guardar pago"}</Button>
      </div>
    </form>
  );
}
