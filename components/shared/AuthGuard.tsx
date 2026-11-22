"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";

type AuthGuardProps = {
  children: React.ReactNode;
};

// Protege las pantallas privadas y manda al login cuando no hay sesión activa.
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const userId = user?.id;
  const [hasHome, setHasHome] = useState<boolean | null>(null);
  const [homeLoading, setHomeLoading] = useState(true);

  useEffect(() => {
    if (!loading && !userId) {
      router.replace("/login");
    }
  }, [loading, router, userId]);

  useEffect(() => {
    let active = true;

    async function checkHome() {
      if (loading) return;

      if (!userId) {
        setHasHome(null);
        setHomeLoading(false);
        return;
      }

      setHomeLoading(true);

      const { data, error } = await supabase
        .from("home_members")
        .select("home_id")
        .eq("profile_id", userId)
        .maybeSingle();

      if (!active) return;

      // Ante un error no inferimos que el usuario no tiene hogar.
      setHasHome(error ? null : Boolean(data));
      setHomeLoading(false);
    }

    checkHome();

    return () => {
      active = false;
    };
  }, [loading, userId]);

  useEffect(() => {
    if (loading || homeLoading || !userId || hasHome === null) return;

    if (!hasHome && pathname !== "/home-entry") {
      router.replace("/home-entry");
      return;
    }

    if (hasHome && pathname === "/home-entry") {
      router.replace("/dashboard");
    }
  }, [hasHome, homeLoading, loading, pathname, router, userId]);

  const redirecting =
    hasHome !== null &&
    ((!hasHome && pathname !== "/home-entry") ||
      (hasHome && pathname === "/home-entry"));

  if (loading || homeLoading || !userId || redirecting) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="h-10 w-10 rounded-full border-4 border-muted border-t-primary" />
      </main>
    );
  }

  return children;
}
