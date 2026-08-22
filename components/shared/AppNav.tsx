"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCheck, HandCoins, House, ReceiptText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Inicio", icon: House },
  { href: "/expenses", label: "Gastos", icon: ReceiptText },
  { href: "/approvals", label: "Aprobar", icon: CheckCheck },
  { href: "/personal-loans", label: "Préstamos", icon: HandCoins },
  // { href: "/transfers", label: "Pagos" },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card md:static md:border-t-0 md:bg-transparent">
      <div className="mx-auto grid max-w-5xl grid-cols-5 gap-1 px-2 py-2 md:flex md:px-4">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-center text-[11px] font-semibold text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:min-h-11 md:flex-row md:gap-2 md:px-3 md:py-2 md:text-sm",
                active && "bg-brand-muted text-primary",
                !active && "hover:bg-muted hover:text-foreground"
              )}
              href={item.href}
              key={item.href}
              aria-current={active ? "page" : undefined}
            >
              <Icon aria-hidden="true" className="h-5 w-5 md:h-[18px] md:w-[18px]" strokeWidth={active ? 2.4 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
