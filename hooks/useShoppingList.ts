"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/types/database";

export type ShoppingItem = Pick<Tables<"shopping_items">, "id" | "name" | "checked">;

export function useShoppingList(userId: string) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [homeId, setHomeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const reload = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);

    try {
      // Resolve membership without coupling this list to financial queries.
      const { data: membership, error: membershipError } = await supabase
        .from("home_members")
        .select("home_id")
        .eq("profile_id", userId)
        .maybeSingle();

      if (membershipError) {
        throw new Error("No se pudo cargar el hogar. Intentá actualizar.");
      }
      if (currentRequest !== requestId.current) return;

      if (!membership) {
        setHomeId(null);
        setItems([]);
        return;
      }

      setHomeId(membership.home_id);
      const { data, error: itemsError } = await supabase
        .from("shopping_items")
        .select("id, name, checked")
        .eq("home_id", membership.home_id)
        .order("checked", { ascending: true })
        .order("created_at", { ascending: false })
        .order("id", { ascending: true });

      if (itemsError) {
        throw new Error("No se pudo cargar la lista del súper. Intentá actualizar.");
      }
      if (currentRequest !== requestId.current) return;
      setItems(data ?? []);
    } catch (error) {
      if (currentRequest !== requestId.current) return;
      setItems([]);
      setError(
        error instanceof Error ? error.message : "No se pudo cargar la lista del súper."
      );
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void reload();
    return () => {
      requestId.current += 1;
    };
  }, [reload]);

  return { items, homeId, loading, error, reload };
}
