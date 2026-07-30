import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

// Botón base de la app. Mantiene acciones claras y consistentes en todas las pantallas.
export function Button({ children, className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-terracotta-600 text-white hover:bg-terracotta-700",
        variant === "secondary" &&
          "border border-finance-line bg-white text-finance-ink hover:bg-terracotta-50",
        variant === "ghost" && "text-finance-muted hover:bg-terracotta-50 hover:text-finance-ink",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
