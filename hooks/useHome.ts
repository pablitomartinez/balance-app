"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateNetBalance } from "@/lib/calculations";
import { supabase } from "@/lib/supabaseClient";
import type { DashboardExpense, PendingApproval } from "@/types/models";
import { useAuth } from "@/hooks/useAuth";

// Este hook será el punto de entrada para cargar hogar, gastos, aprobaciones y transferencias.
// En este primer incremento devuelve una estructura vacía para montar el dashboard sin mezclar UI y datos.
export function useHome() {
  const { user, loading: authLoading } = useAuth();

  const [home, setHome] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [homeLoading, setHomeLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    let active = true;

    async function loadHomeMembership() {
      if (authLoading) {
        setHomeLoading(true);
        return;
      }

      if (!user) {
      setHome(null);
      setHomeLoading(false);
      return;
    }

      setError(null);
      setHome(null);
      setHomeLoading(true);
      
     

      const {
        data: membership,
        error: membershipError,
      } = await supabase
        .from("home_members")
        .select("home_id")
        .eq("profile_id", user.id)
        .maybeSingle();
      
      
      
      
      if (membershipError) {
        setError("No se pudo cargar la información del hogar.");
      }
      
      if (!membership) {
        if (active) {
          setHome(null);
          setHomeLoading(false);
        }
        return;
      }


      const {
        data: home,
        error: homeError,
      } = await supabase
        .from("homes")
        .select("id, name")
        .eq("id", membership.home_id)
        .single();
      
      
      
      
      if (active) {
        setHome(home);
        setHomeLoading(false);
      }
    }

    loadHomeMembership();


    

    return () => {
      active = false;
    };
  }, [authLoading, user]);

  const balance = useMemo(
    () => calculateNetBalance([], "current-user", "other-user"),
    []
  );

  const recentExpenses: DashboardExpense[] = [];
  const pendingApprovals: PendingApproval[] = [];

  return {
    balance,
    recentExpenses,
    pendingApprovals,
    home,
    hasHome: home !== null,
    error,
    loading: authLoading || homeLoading,
  };
}