"use client";

import Image from "next/image";
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
        <div className="flex min-w-0 items-center gap-2.5">
          <Image
            src="/logo.png"
            alt=""
            width={38}
            height={38}
            className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
            priority
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              Balance Hogar
            </p>
            <h1 className="truncate text-base font-bold text-foreground sm:text-lg">
              Tu balance compartido
            </h1>
          </div>
        </div>
        <Button variant="ghost" className="px-3" onClick={handleSignOut}>
          Salir
        </Button>
      </div>
    </header>
  );
}
