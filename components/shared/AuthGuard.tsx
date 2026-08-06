"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

type AuthGuardProps = {
  children: React.ReactNode;
};

// Protege las pantallas privadas y manda al login cuando no hay sesión activa.
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="h-10 w-10 rounded-full border-4 border-muted border-t-primary" />
      </main>
    );
  }

  return children;
}
