"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  isNavigationItemActive,
  navigationItems,
} from "@/components/shared/navigationItems";
import { cn } from "@/lib/utils";

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-card lg:hidden">
      <div className="mx-auto grid max-w-5xl grid-cols-5 gap-1 px-2 py-2">
        {navigationItems.map((item) => {
          const active = isNavigationItemActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-center text-[11px] font-semibold text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active && "bg-brand-muted text-primary",
                !active && "hover:bg-muted hover:text-foreground"
              )}
              href={item.href}
              key={item.href}
              aria-current={active ? "page" : undefined}
            >
              <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
