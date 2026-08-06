import { formatCurrency } from "@/lib/utils";
import type { BalanceSummary } from "@/types/models";

type BalanceCardProps = {
  balance: BalanceSummary;
};

// Tarjeta principal del dashboard. Muestra una sola verdad: cómo está el balance entre ambos.
export function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <div className="rounded-md bg-primary p-5 text-primary-foreground shadow-soft">
      <p className="text-sm font-medium text-primary-foreground">Balance actual</p>
      <p className="mt-3 text-4xl font-black">{formatCurrency(balance.amount)}</p>
      <p className="mt-2 text-sm font-semibold text-primary-foreground">{balance.label}</p>
    </div>
  );
}
