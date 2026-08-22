"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useHome } from "@/hooks/useHome";
import { createHomeInvitation } from "@/lib/invitations";

export default function InvitePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const {
    home,
    memberCount,
    loading: homeLoading,
  } = useHome(user?.id ?? null);

  const [code, setCode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCanShare(typeof navigator.share === "function");
  }, []);

  async function handleCreateInvitation() {
    if (!home || memberCount !== 1) {
      setError("No se encontró el hogar.");
      return;
    }

    setError(null);
    setCode(null);
    setSaving(true);

    try {
      const invitationCode = await createHomeInvitation(home.id);

      setCode(String(invitationCode));
      setCopied(false);
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

  async function handleCopyCode() {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setError("No se pudo copiar el código. Podés copiarlo manualmente.");
    }
  }

  async function handleShareInvitation() {
    if (!code || !canShare) return;

    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(
      /\/$/,
      ""
    );
    const siteUrl = configuredSiteUrl || window.location.origin;

    setError(null);
    setSharing(true);

    try {
      await navigator.share({
        title: "Invitación a Balance",
        text: `Te invito a nuestro hogar en Balance 💜\n\nTu código para unirte es: ${code}\n\nAbrí Balance y elegí \"Unirme con código\".`,
        url: `${siteUrl}/join-home`,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setError(
        "No se pudo compartir la invitación. Podés copiar el código."
      );
    } finally {
      setSharing(false);
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

  if (memberCount === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
          <h1 className="text-2xl font-black text-foreground">
            No pudimos verificar el hogar
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Intentá nuevamente antes de generar una invitación.
          </p>
        </div>
      </main>
    );
  }

  if (memberCount >= 2) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
          <p className="text-sm font-semibold text-primary">{home.name}</p>
          <h1 className="mt-3 text-2xl font-black text-foreground">
            El hogar ya está completo
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Ya están conectadas las dos personas del hogar.
          </p>
          <Button
            className="mt-5 w-full"
            type="button"
            onClick={() => router.replace("/dashboard")}
          >
            Continuar al inicio
          </Button>
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
            El hogar está listo.
          </h1>

          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Generá un código y enviáselo a la otra persona para que se una. La
            invitación tiene una duración de 24 horas.
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

              {canShare && (
                <Button
                  className="w-full"
                  disabled={sharing}
                  type="button"
                  onClick={handleShareInvitation}
                >
                  {sharing ? "Compartiendo..." : "Compartir invitación"}
                </Button>
              )}

              <Button
                className="w-full"
                variant="secondary"
                type="button"
                onClick={handleCopyCode}
              >
                {copied ? "Código copiado" : "Copiar código"}
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

          <Button
            className="w-full"
            variant="ghost"
            type="button"
            onClick={() => router.replace("/dashboard")}
          >
            Continuar al inicio
          </Button>
        </div>
      </section>
    </main>
  );
}
