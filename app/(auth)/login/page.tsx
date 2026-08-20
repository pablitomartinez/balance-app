"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const {
    user,
    loading,
    error,
    signInWithEmail,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    async function checkHome() {
      if (loading || !user) return;

      const { data } = await supabase
        .from("home_members")
        .select("home_id")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (data) {
        router.replace("/dashboard");
      } else {
        router.replace("/home-entry");
      }
    }

    checkHome();
  }, [loading, user, router]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password) return;

    const success = await signInWithEmail(email, password);

    if (!success) return;
  }

  return (
    <main className="flex min-h-screen items-center px-4 py-8">
      <section className="mx-auto w-full max-w-sm">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wide text-primary">
            Balance Hogar
          </p>

          <h1 className="mt-3 text-4xl font-black leading-tight text-foreground">
            Gastos claros entre dos personas.
          </h1>

          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Ingresá con tu email y contraseña para continuar.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-semibold text-foreground"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-border bg-card p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-semibold text-foreground"
            >
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-border bg-card p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive-border bg-destructive-muted p-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !email.trim() || !password}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </section>
    </main>
  );
}
