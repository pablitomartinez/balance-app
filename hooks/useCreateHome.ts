"use client";

import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useCreateHome() {
  const [loading, setLoading] = useState(false);

  const createHome = useCallback(async (name: string): Promise<string> => {
    const normalizedName = name.trim();

    if (!normalizedName) {
      throw new Error("El nombre del hogar es obligatorio.");
    }

    setLoading(true);

    try {

      const { data: user } = await supabase.auth.getUser();const session = await supabase.auth.getSession();
      
      const { data, error } = await supabase.rpc("create_home", {
        p_name: normalizedName,
      });

      // const { data, error } = await supabase.rpc("create_home", {
      //   p_name: normalizedName,
      // });

      if (error) {
        throw error;
      }

      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createHome,
    loading,
  };
}