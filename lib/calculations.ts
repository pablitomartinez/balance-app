import type { BalanceSummary } from "@/types/models";

export type BalanceMovement = {
  fromUserId: string;
  toUserId: string;
  amount: number;
};

export type ExpenseShareForBalance = {
  profileId: string;
  expectedAmount: number;
  actualAmount: number;
};

export function calculateBalanceFromShares(
  shares: ExpenseShareForBalance[],
  currentUserId: string
): BalanceSummary {
  const currentUserBalance = shares.reduce((total, share) => {
    if (share.profileId !== currentUserId) {
      return total;
    }

    return total + (share.actualAmount - share.expectedAmount);
  }, 0);

  const epsilon = 0.01;

  if (Math.abs(currentUserBalance) < epsilon) {
    return {
      amount: 0,
      direction: "even",
      label: "Están a mano",
    };
  }

  if (currentUserBalance > 0) {
    return {
      amount: Math.abs(currentUserBalance),
      direction: "second_owes_first",
      label: "La otra persona te debe",
    };
  }

  return {
    amount: Math.abs(currentUserBalance),
    direction: "first_owes_second",
    label: "Vos debés",
  };
}

// Este archivo centraliza los cálculos financieros.
// La deuda nunca se guarda en base de datos: se reconstruye desde movimientos.

export function calculateNetBalance(
  movements: BalanceMovement[],
  firstUserId: string,
  secondUserId: string
): BalanceSummary {
  // Este cálculo determina cuánto cambia la relación entre dos personas.
  // Si A paga a B, A reduce lo que debe o aumenta lo que B le debe.
  const net = movements.reduce((total, movement) => {
    if (movement.fromUserId === firstUserId && movement.toUserId === secondUserId) {
      return total - movement.amount;
    }

    if (movement.fromUserId === secondUserId && movement.toUserId === firstUserId) {
      return total + movement.amount;
    }

    return total;
  }, 0);

  if (net === 0) {
    return {
      amount: 0,
      direction: "even",
      label: "Están a mano"
    };
  }

  if (net > 0) {
    return {
      amount: Math.abs(net),
      direction: "second_owes_first",
      label: "La otra persona te debe"
    };
  }

  return {
    amount: Math.abs(net),
    direction: "first_owes_second",
    label: "Vos debés"
  };
}

export function splitExpenseEqually(amount: number, memberIds: string[]): BalanceMovement[] {
  // Este cálculo existe porque el MVP divide gastos 50/50 entre dos miembros del hogar.
  if (memberIds.length !== 2) {
    return [];
  }

  const share = amount / 2;

  return [
    {
      fromUserId: memberIds[1],
      toUserId: memberIds[0],
      amount: share
    }
  ];
}

