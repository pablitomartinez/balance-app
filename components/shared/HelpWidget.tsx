"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, X } from "lucide-react";

export function HelpWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-4 z-40 md:bottom-6 md:right-6">
      <div
        className={[
          "absolute bottom-16 right-0 w-72 origin-bottom-right transition-all duration-200 ease-out",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-2 scale-95 opacity-0",
        ].join(" ")}
      >
        <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-foreground">
                ¿Necesitás ayuda?
              </p>

              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Mirá cómo registrar gastos, préstamos y mantener las cuentas al día.
              </p>
            </div>

            <button
              type="button"
              aria-label="Cerrar ayuda"
              onClick={() => setOpen(false)}
              className="shrink-0 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <Link
            href="/help"
            onClick={() => setOpen(false)}
            className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Ver cómo usar Balance
          </Link>
        </div>
      </div>

      <button
        type="button"
        aria-label={open ? "Cerrar ayuda" : "Abrir ayuda"}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={[
          "flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft",
          "transition-all duration-200 hover:scale-105 active:scale-95",
          open ? "rotate-6" : "rotate-0",
        ].join(" ")}
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <HelpCircle className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}