"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Tables } from "@/types/database";

export type ShoppingItem = Pick<Tables<"shopping_items">, "id" | "name" | "checked">;

export function useShoppingList(userId: string) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [homeId, setHomeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const itemsHomeId = useRef<string | null>(null);

  const reload = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setRefreshing(true);
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
        itemsHomeId.current = null;
        setHomeId(null);
        setItems([]);
        return;
      }

      if (membership.home_id !== itemsHomeId.current) {
        itemsHomeId.current = null;
        setHomeId(null);
        setItems([]);
        setLoading(true);
      }
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
      itemsHomeId.current = membership.home_id;
      setHomeId(membership.home_id);
      setItems(data ?? []);
    } catch (error) {
      if (currentRequest !== requestId.current) return;
      setError(
        error instanceof Error ? error.message : "No se pudo cargar la lista del súper."
      );
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    void reload();
    return () => {
      requestId.current += 1;
    };
  }, [reload]);

  const appendItem = useCallback((item: ShoppingItem) => {
    setItems((current) => [...current, item]);
  }, []);

  const updateItemChecked = useCallback((itemId: string, checked: boolean) => {
    setItems((current) =>
      current.map((item) => item.id === itemId ? { ...item, checked } : item)
    );
  }, []);

  const clearItems = useCallback(() => {
    // Invalidate any older read before committing the server-confirmed empty list.
    requestId.current += 1;
    setItems([]);
    setError(null);
    setRefreshing(false);
  }, []);

  return {
    items, homeId, loading, refreshing, error, reload, appendItem, updateItemChecked, clearItems,
  };
}
