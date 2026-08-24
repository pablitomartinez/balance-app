"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  variant?: "icon" | "sidebar";
};

export function ThemeToggle({ variant = "icon" }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      aria-label={mounted ? label : "Cambiar tema"}
      title={mounted ? label : undefined}
      disabled={!mounted}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-default",
        variant === "icon" && "w-11 shrink-0 focus-visible:ring-offset-background",
        variant === "sidebar" &&
          "w-full justify-start gap-3 px-3 py-2 text-sm font-semibold focus-visible:ring-offset-card"
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn("h-5 w-5 shrink-0", !mounted && "invisible")}
      />
      {variant === "sidebar" && (
        <span className={cn(!mounted && "invisible")}>{label}</span>
      )}
    </button>
  );
}
