import { formatCurrency } from "@/lib/utils";
import type { BalanceSummary } from "@/types/models";

type BalanceCardProps = {
  balance: BalanceSummary;
};

// Tarjeta principal del dashboard. Muestra una sola verdad: cómo está el balance entre ambos.
export function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <div className="rounded-md bg-terracotta-700 p-5 text-white shadow-soft">
      <p className="text-sm font-medium text-terracotta-100">Balance actual</p>
      <p className="mt-3 text-4xl font-black">{formatCurrency(balance.amount)}</p>
      <p className="mt-2 text-sm font-semibold text-terracotta-50">{balance.label}</p>
    </div>
  );
}
