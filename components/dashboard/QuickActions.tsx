import Link from "next/link";
import { CheckCheck, HandCoins, Plus, ReceiptText } from "lucide-react";

const actions = [
  { href: "/expenses", label: "Registrar gasto", icon: ReceiptText },
  { href: "/personal-loans", label: "Registrar préstamo personal", icon: HandCoins },
  { href: "/approvals", label: "Revisar aprobaciones", icon: CheckCheck },
];

export function QuickActions() {
  return (
    <div className="space-y-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className="group flex min-h-11 items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-semibold text-foreground transition hover:border-brand-border hover:bg-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-primary transition group-hover:bg-card">
              <Icon aria-hidden="true" className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">{action.label}</span>
            <Plus aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        );
      })}
    </div>
  );
}
