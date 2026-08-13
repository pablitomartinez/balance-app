"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type ExpenseCategory = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};

export function useCategories(homeId: string | null) {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      if (!homeId) {
        if (active) {
          setCategories([]);
          setLoading(false);
          setError(null);
        }

        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name, icon, color")
        .eq("home_id", homeId)
        .order("name");

      if (!active) return;

      if (categoriesError) {
        setCategories([]);
        setError("No se pudieron cargar las categorías.");
        setLoading(false);
        return;
      }

      setCategories(data ?? []);
      setLoading(false);
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, [homeId]);

  return {
    categories,
    loading,
    error,
  };
}