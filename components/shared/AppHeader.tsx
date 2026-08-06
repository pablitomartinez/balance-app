"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

// Encabezado principal con la acción de salida centralizada en el hook de auth.
export function AppHeader() {
  const router = useRouter();
  const { signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Balance Hogar
          </p>
          <h1 className="text-lg font-bold text-foreground">Tu balance compartido</h1>
        </div>
        <Button variant="ghost" className="px-3" onClick={handleSignOut}>
          Salir
        </Button>
      </div>
    </header>
  );
}
