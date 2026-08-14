import { formatCurrency } from "@/lib/utils";
import type { BalanceSummary } from "@/types/models";

type BalanceCardProps = {
  balance: BalanceSummary;
  otherMemberName: string | null;
};

function getBalanceMessage(
  direction: BalanceSummary["direction"],
  otherMemberName: string | null
) {
  if (direction === "second_owes_first") {
    return otherMemberName ? `${otherMemberName} te debe` : "Te deben";
  }

  if (direction === "first_owes_second") {
    return otherMemberName
      ? `Le debés a ${otherMemberName}`
      : "Tenés un saldo pendiente";
  }

  return "Están a mano";
}

// Tarjeta principal del dashboard. Presenta el resultado calculado sin modificarlo.
export function BalanceCard({ balance, otherMemberName }: BalanceCardProps) {
  const message = getBalanceMessage(balance.direction, otherMemberName);

  return (
    <div className="rounded-md bg-primary p-5 text-primary-foreground shadow-soft">
      <p className="break-words text-sm font-semibold text-primary-foreground">
        {message}
      </p>
      <p className="mt-3 break-all text-4xl font-black leading-none">
        {formatCurrency(balance.amount)}
      </p>
    </div>
  );
}
