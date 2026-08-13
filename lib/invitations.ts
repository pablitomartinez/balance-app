import { supabase } from "@/lib/supabaseClient";

export async function createHomeInvitation(homeId: string) {
  if (!homeId) {
    throw new Error("El hogar es obligatorio.");
  }

  const { data, error } = await supabase.rpc("create_home_invitation", {
    p_home_id: homeId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function acceptHomeInvitation(code: string) {
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    throw new Error("El código de invitación es obligatorio.");
  }

  const { data, error } = await supabase.rpc("accept_home_invitation", {
    p_code: normalizedCode,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}