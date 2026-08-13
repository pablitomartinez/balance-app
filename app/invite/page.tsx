"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useHome } from "@/hooks/useHome";
import { createHomeInvitation } from "@/lib/invitations";

export default function InvitePage() {
  const { user, loading: authLoading } = useAuth();

  const {
    home,
    loading: homeLoading,
  } = useHome(user?.id ?? null);

  const [code, setCode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateInvitation() {
    if (!home) {
      setError("No se encontró el hogar.");
      return;
    }

    setError(null);
    setCode(null);
    setSaving(true);

    try {
      const invitationCode = await createHomeInvitation(home.id);

      setCode(String(invitationCode));
    } catch (error) {
      console.error("Error creating home invitation:", error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo generar la invitación."
      );
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || homeLoading) {
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

          <p className="mt-2 text-sm text-muted-foreground">
            Necesitás iniciar sesión para generar una invitación.
          </p>
        </div>
      </main>
    );
  }

  if (!home) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
          <h1 className="text-2xl font-black text-foreground">
            No tenés un hogar
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Primero necesitás crear un hogar.
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
            {home.name}
          </p>

          <h1 className="mt-3 text-4xl font-black leading-tight text-foreground">
            Invitá a la otra persona.
          </h1>

          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Generá un código y compartilo. La invitación tiene una duración de
            24 horas.
          </p>
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-5">
          {code ? (
            <>
              <div className="rounded-md border border-border bg-muted px-4 py-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Código de invitación
                </p>

                <p className="mt-3 text-3xl font-black tracking-[0.25em] text-foreground">
                  {code}
                </p>
              </div>

              <p className="text-sm leading-6 text-muted-foreground">
                Compartile este código a la otra persona para que pueda
                unirse a <strong>{home.name}</strong>.
              </p>

              <Button
                className="w-full"
                variant="secondary"
                type="button"
                onClick={() => navigator.clipboard.writeText(code)}
              >
                Copiar código
              </Button>
            </>
          ) : (
            <Button
              className="w-full"
              disabled={saving}
              type="button"
              onClick={handleCreateInvitation}
            >
              {saving ? "Generando..." : "Generar código"}
            </Button>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive-border bg-destructive-muted p-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}