import { supabase } from "@/lib/supabaseClient";

export async function clearShoppingList() {
  const { data, error } = await supabase.rpc("clear_shopping_list");

  if (error) {
    throw new Error("No se pudo vaciar la lista. Intentá de nuevo.");
  }

  return data;
}

export async function addShoppingItem(name: string) {
  const { data, error } = await supabase.rpc("add_shopping_item", {
    p_name: name.trim(),
  });

  if (error) {
    throw new Error("No se pudo agregar el producto. Tu texto sigue en el formulario.");
  }

  return data;
}

export async function setShoppingItemChecked(itemId: string, checked: boolean) {
  const { error } = await supabase.rpc("set_shopping_item_checked", {
    p_item_id: itemId,
    p_checked: checked,
  });

  if (error) {
    throw new Error("No se pudo cambiar el estado del producto. Intentá de nuevo.");
  }
}
