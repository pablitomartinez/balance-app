"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useHome } from "@/hooks/useHome";
import { acceptHomeInvitation } from "@/lib/invitations";

export default function JoinHomePage() {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();

  const {
    hasHome,
    loading: homeLoading,
  } = useHome(user?.id ?? null);

  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !homeLoading && hasHome) {
      router.replace("/dashboard");
    }
  }, [authLoading, homeLoading, hasHome, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setError(null);

    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setError("Ingresá el código de invitación.");
      return;
    }

    setSaving(true);

    try {
      await acceptHomeInvitation(normalizedCode);

      router.replace("/dashboard");
    } catch (error) {
      console.error("Error accepting home invitation:", error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo aceptar la invitación."
      );
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || homeLoading || hasHome) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <p className="text-sm text-muted-foreground">
          Cargando información del hogar...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
          <h1 className="text-2xl font-black text-foreground">
            Iniciá sesión
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Necesitás iniciar sesión para aceptar una invitación.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <section className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-sm font-semibold text-primary">
            Balance Hogar
          </p>

          <h1 className="mt-3 text-4xl font-black leading-tight text-foreground">
            Unite a un hogar.
          </h1>

          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Ingresá el código que te compartió la otra persona para empezar a
            organizar los gastos juntos.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-border bg-card p-5"
        >
          <label
            className="block"
            htmlFor="invitation-code"
          >
            <span className="text-sm font-semibold text-foreground">
              Código de invitación
            </span>

            <input
              id="invitation-code"
              className="mt-2 w-full rounded-md border border-input bg-background px-4 py-4 text-center text-xl font-bold uppercase tracking-[0.25em] text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
              placeholder="FCD78165"
              value={code}
              onChange={(event) => {
                setCode(event.target.value.toUpperCase());
                setError(null);
              }}
              maxLength={8}
              autoComplete="off"
              autoCapitalize="characters"
              disabled={saving}
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive-border bg-destructive-muted p-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <Button
            className="w-full"
            disabled={saving || code.trim().length !== 8}
            type="submit"
          >
            {saving ? "Uniéndote..." : "Unirme al hogar"}
          </Button>
        </form>
      </section>
    </main>
  );
}