"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useHome } from "@/hooks/useHome";
import { Section } from "@/components/ui/Section";

export default function SettingsPage() {
  const { user } = useAuth();
  const { home, memberCount, loading } = useHome(user?.id ?? null);

  return (
    <Section title="Ajustes del hogar">
      <div className="rounded-lg border border-border bg-card p-5">
        {loading ? (
          <p className="text-sm text-muted-foreground">
            Cargando información del hogar...
          </p>
        ) : (
          <>
            <p className="font-bold text-foreground">
              {home?.name ?? "Tu hogar"}
            </p>

            {memberCount === 1 ? (
              <>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Falta sumar a la otra persona para completar el hogar.
                </p>
                <Link
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  href="/invite"
                >
                  Invitar a la otra persona
                </Link>
              </>
            ) : (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {memberCount === 2
                  ? "El hogar ya tiene sus dos integrantes."
                  : "No se pudo verificar la cantidad de integrantes."}
              </p>
            )}
          </>
        )}
      </div>
    </Section>
  );
}
