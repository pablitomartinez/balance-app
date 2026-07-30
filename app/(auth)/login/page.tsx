"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signInWithEmail } = useAuth();

  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, router, user]);

  return (
    <main className="flex min-h-screen items-center px-4 py-8">
      <section className="mx-auto w-full max-w-sm">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wide text-terracotta-700">
            Balance Hogar
          </p>

          <h1 className="mt-3 text-4xl font-black leading-tight text-finance-ink">
            Gastos claros entre dos personas.
          </h1>

          <p className="mt-4 text-base leading-7 text-finance-muted">
            Ingresá con tu email para continuar.
          </p>
        </div>

        <input
          className="w-full mb-3 p-3 border rounded"
          placeholder="tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button
          className="w-full"
          disabled={loading || !email}
          onClick={() => signInWithEmail(email)}
        >
          Ingresar
        </Button>
      </section>
    </main>
  );
}