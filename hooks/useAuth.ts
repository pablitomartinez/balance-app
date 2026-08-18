"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
};

// Autenticación principal de Balance mediante email + contraseña.
// La sesión persistente es gestionada por Supabase.
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      setError(null);

      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (error) {
        setError(error.message);
      }

      setUser(data.session?.user ?? null);
      setLoading(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signInWithEmail(
    email: string,
    password: string
  ): Promise<boolean> {
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message);
      return false;
    }

    return true;
  }

  async function signUpWithEmail(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    needsConfirmation: boolean;
  }> {
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message);

      return {
        success: false,
        needsConfirmation: false,
      };
    }

    return {
      success: true,
      needsConfirmation: !data.session,
    };
  }

  async function signOut() {
    setError(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
    }
  }

  return {
    user,
    loading,
    error,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };
}