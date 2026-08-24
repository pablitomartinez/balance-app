"use client";

import Image from "next/image";
import Link from "next/link";
import { CircleHelp } from "lucide-react";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/shared/SignOutButton";
import {
  isNavigationItemActive,
  navigationItems,
} from "@/components/shared/navigationItems";
import { cn } from "@/lib/utils";

type DesktopSidebarProps = {
  onSignOut: () => Promise<void>;
};

export function DesktopSidebar({ onSignOut }: DesktopSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-card/90 px-4 py-5 backdrop-blur lg:flex">
      <div className="flex min-w-0 items-center gap-3 px-2">
        <Image
          src="/logo.png"
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 object-contain"
          priority
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Balance Hogar
          </p>
          <p className="truncate text-sm font-bold text-foreground">
            Tu balance compartido
          </p>
        </div>
      </div>

      <nav aria-label="Navegación principal" className="mt-8 space-y-1">
        {navigationItems.map((item) => {
          const active = isNavigationItemActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                active && "bg-brand-muted text-primary",
                !active && "hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon
                aria-hidden="true"
                className="h-5 w-5 shrink-0"
                strokeWidth={active ? 2.4 : 2}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 border-t border-border pt-4">
        <Link
          href="/help"
          aria-current={pathname === "/help" ? "page" : undefined}
          className={cn(
            "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
            pathname === "/help" && "bg-brand-muted text-primary",
            pathname !== "/help" && "hover:bg-muted hover:text-foreground"
          )}
        >
          <CircleHelp aria-hidden="true" className="h-5 w-5 shrink-0" />
          <span>Ayuda</span>
        </Link>

        <SignOutButton
          onSignOut={onSignOut}
          showIcon
          className="w-full px-3"
        />
      </div>
    </aside>
  );
}
