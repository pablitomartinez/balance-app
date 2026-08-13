import { supabase } from "@/lib/supabaseClient";

export async function createHomeInvitation(homeId: string) {
  const { data, error } = await supabase.rpc("create_home_invitation", {
    p_home_id: homeId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function acceptHomeInvitation(code: string) {
  const { data, error } = await supabase.rpc("accept_home_invitation", {
    p_code: code.trim(),
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}