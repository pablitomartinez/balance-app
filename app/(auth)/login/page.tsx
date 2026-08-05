"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, error, signInWithEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  async function handleLogin() {
    setEmailSent(false);
  
    const success = await signInWithEmail(email);
  
    if (success) {
      setEmailSent(true);
    }
  }

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
        router.replace("/create-home");
      }
    }
  
    checkHome();
  }, [loading, user, router]);

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
          className="mb-3 w-full rounded border p-3"
          placeholder="tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && (
          <p className="mb-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {emailSent && !error && (
          <p className="mb-3 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            Revisá tu correo. Te enviamos un enlace para iniciar sesión.
          </p>
        )}

        <Button
          className="w-full"
          disabled={loading || !email}
          onClick={handleLogin}
        >
          Ingresar
        </Button>
      </section>
    </main>
  );
}