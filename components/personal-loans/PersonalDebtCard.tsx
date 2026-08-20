import Link from "next/link";
import type { PersonalDebtDirection } from "@/hooks/usePersonalLoans";
import { formatCurrency } from "@/lib/utils";

type PersonalDebtCardProps = {
  amount: number;
  direction: PersonalDebtDirection;
  otherMemberName: string | null;
};

function message(direction: PersonalDebtDirection, otherMemberName: string | null) {
  const other = otherMemberName ?? "la otra persona";
  if (direction === "current_user_owes") return `Le debés a ${other}`;
  if (direction === "other_user_owes") return `${other} te debe`;
  return "No hay deuda personal pendiente";
}

export function PersonalDebtCard({ amount, direction, otherMemberName }: PersonalDebtCardProps) {
  return (
    <section className="rounded-md border border-border bg-card p-5 shadow-soft">
      <p className="text-sm font-semibold text-muted-foreground">Deuda personal</p>
      <p className="mt-2 text-lg font-bold text-foreground">{message(direction, otherMemberName)}</p>
      <p className="mt-2 text-3xl font-black text-foreground">{formatCurrency(amount)}</p>
      <Link href="/personal-loans" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">Ver préstamos</Link>
    </section>
  );
}
