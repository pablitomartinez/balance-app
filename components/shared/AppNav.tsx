"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/expenses", label: "Gastos" },
  { href: "/approvals", label: "Aprobar" },
  // { href: "/transfers", label: "Pagos" },
  { href: "/settings", label: "Ajustes" }
];

// Navegación simple y legible para móvil y escritorio.
export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card md:static md:border-t-0 md:bg-transparent">
      <div className="mx-auto grid max-w-5xl grid-cols-4 gap-1 px-2 py-2 md:flex md:px-4">
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              className={cn(
                "rounded-md px-2 py-2 text-center text-xs font-semibold text-muted-foreground transition md:px-3 md:text-sm",
                active && "bg-muted text-primary",
                !active && "hover:bg-muted hover:text-foreground"
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
