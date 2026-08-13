"use client";

import { useState } from "react";
import { createHomeInvitation } from "@/lib/invitations";

type InvitationTestProps = {
  homeId: string;
};

export function InvitationTest({ homeId }: InvitationTestProps) {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateInvitation() {
    setLoading(true);
    setError(null);
    setCode(null);

    try {
      const invitationCode = await createHomeInvitation(homeId);
      setCode(invitationCode);
    } catch (error) {
      console.error("Error creating invitation:", error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo crear la invitación."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-md border border-border bg-card p-4">
      <div>
        <h2 className="text-base font-bold text-foreground">
          Prueba de invitación
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Genera un código temporal para otro miembro.
        </p>
      </div>

      <button
        type="button"
        onClick={handleCreateInvitation}
        disabled={loading || !homeId}
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Generando..." : "Generar invitación"}
      </button>

      {code && (
        <div className="rounded-md border border-border bg-muted p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Código
          </p>

          <p className="mt-1 text-2xl font-black tracking-[0.2em] text-foreground">
            {code}
          </p>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}