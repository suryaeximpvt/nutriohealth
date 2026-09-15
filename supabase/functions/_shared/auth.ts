// Shared authentication guard for Vellyn edge functions.
// Functions deploy with verify_jwt = false, so every function that handles
// user-specific data must validate the caller's token in code before doing work.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export interface AuthedUser {
  id: string;
  email?: string;
}

/**
 * Returns the authenticated user for this request, or null when the caller
 * has no valid session.
 */
export const getAuthedUser = async (req: Request): Promise<AuthedUser | null> => {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) return null;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;
  return { id: data.user.id, email: data.user.email ?? undefined };
};

export const unauthorized = (corsHeaders: Record<string, string>) =>
  new Response(JSON.stringify({ error: "Not authenticated" }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
