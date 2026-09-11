import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { CaptureMethod } from "@/lib/capture";

interface PrefRow {
  method: string;
  offered_count: number;
  used_count: number;
  last_used_at: string | null;
}

const DEFAULT_ORDER: CaptureMethod[] = ["voice", "text", "photo"];

/**
 * Tracks which capture methods a user actually responds to, so Nutrio can
 * offer the easiest one first instead of forcing photos on everyone.
 */
export const useCapturePreference = () => {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<PrefRow[]>([]);

  const refresh = useCallback(async () => {
    if (!user) return setPrefs([]);
    const { data } = await supabase
      .from("capture_preferences")
      .select("method,offered_count,used_count,last_used_at")
      .eq("user_id", user.id);
    setPrefs((data ?? []) as unknown as PrefRow[]);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const bump = useCallback(
    async (method: CaptureMethod, field: "offered" | "used") => {
      if (!user) return;
      const existing = prefs.find((p) => p.method === method);
      const row = {
        user_id: user.id,
        method,
        offered_count: (existing?.offered_count ?? 0) + (field === "offered" ? 1 : 0),
        used_count: (existing?.used_count ?? 0) + (field === "used" ? 1 : 0),
        last_used_at: field === "used" ? new Date().toISOString() : existing?.last_used_at ?? null,
      };
      await supabase.from("capture_preferences").upsert(row as never, { onConflict: "user_id,method" });
      await refresh();
    },
    [user, prefs, refresh],
  );

  /** Methods ordered by how often this person actually uses them. */
  const orderedMethods = useCallback(
    (methods: CaptureMethod[] = DEFAULT_ORDER) => {
      const score = (m: CaptureMethod) => {
        const p = prefs.find((x) => x.method === m);
        if (!p) return 0;
        const rate = p.offered_count > 0 ? p.used_count / p.offered_count : 0;
        return p.used_count * 2 + rate;
      };
      return [...methods].sort((a, b) => score(b) - score(a));
    },
    [prefs],
  );

  const preferredMethod = orderedMethods()[0];

  /** True when photos are repeatedly offered but almost never used. */
  const avoidsPhotos = (() => {
    const p = prefs.find((x) => x.method === "photo");
    return !!p && p.offered_count >= 4 && p.used_count === 0;
  })();

  return { prefs, orderedMethods, preferredMethod, avoidsPhotos, markOffered: (m: CaptureMethod) => bump(m, "offered"), markUsed: (m: CaptureMethod) => bump(m, "used"), refresh };
};
