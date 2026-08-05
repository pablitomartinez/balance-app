"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

// Este hook maneja autenticación con Supabase (email OTP temporal)
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      setError(null);

      const { data, error } = await supabase.auth.getSession();

      if (active) {
        if (error) {
          setError(error.message);
        }

        setUser(data.session?.user ?? null);
        setLoading(false);
      }
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

  // Login por email (sin Google, sin OAuth)
  async function signInWithEmail(email: string): Promise<boolean> {
    setError(null);
  
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "http://localhost:3000",
      },
    });
  
    if (error) {
      setError(error.message);
      return false;
    }
  
    return true;
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
    signOut,
  };
}