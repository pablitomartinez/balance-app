"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useCreateHome } from "@/hooks/useCreateHome";
import { useHome } from "@/hooks/useHome";

export default function CreateHomePage() {
  const router = useRouter();

  const { createHome, loading } = useCreateHome();
  const { hasHome, loading: homeLoading } = useHome();

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!homeLoading && hasHome) {
      router.replace("/dashboard");
    }
  }, [homeLoading, hasHome, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    try {
      await createHome(name);
      router.replace("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo crear el hogar."
      );
    }
  }

  if (homeLoading || hasHome) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center px-4 py-8">
      <section className="mx-auto w-full max-w-sm">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wide text-primary">
            Balance Hogar
          </p>

          <h1 className="mt-3 text-4xl font-black leading-tight text-foreground">
            Creá tu hogar.
          </h1>

          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Elegí un nombre para empezar a organizar los gastos compartidos.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            className="mb-2 block text-sm font-semibold text-foreground"
            htmlFor="home-name"
          >
            Nombre del hogar
          </label>

          <input
            id="home-name"
            className="mb-3 w-full rounded border border-input p-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
            placeholder="Ej. Casa de Ana y Juan"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
            aria-describedby={error ? "home-name-error" : undefined}
            aria-invalid={Boolean(error)}
          />

          {error && (
            <p
              id="home-name-error"
              className="mb-3 rounded-md border border-destructive-border bg-destructive-muted p-3 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}

          <Button
            className="w-full"
            disabled={loading || !name.trim()}
            type="submit"
          >
            Crear hogar
          </Button>
        </form>
      </section>
    </main>
  );
}
