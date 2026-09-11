import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TRACKING_FRICTION_REASONS } from "@/lib/capture";
import type { FoodCapture } from "@/hooks/useFoodCaptures";

interface Props {
  captures: FoodCapture[];
  delay?: number;
}

/**
 * Asked rarely: only after several very quiet days, and at most once a week.
 * Stored as behavioural friction, never used to shame the user.
 */
export const FrictionFeedbackCard = ({ captures, delay = 0 }: Props) => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const cutoff = new Date(Date.now() - 3 * 86400000);
      const recent = captures.filter((c) => new Date(c.captured_at) >= cutoff);
      if (recent.length > 1) return;

      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data } = await supabase
        .from("food_friction")
        .select("id")
        .eq("user_id", user.id)
        .eq("friction_type", "tracking")
        .gte("created_at", weekAgo)
        .limit(1);
      if (!data?.length) setShow(true);
    })();
  }, [user, captures]);

  if (!show || dismissed) return null;

  const record = async (reason: string) => {
    if (!user) return;
    await supabase.from("food_friction").insert({
      user_id: user.id,
      friction_type: "tracking",
      level: "reported",
      score: 1,
      evidence: { reason, source: "friction_prompt" },
      computed_at: new Date().toISOString(),
    } as never);
    setDismissed(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card border border-border rounded-2xl p-4 relative"
    >
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss question"
        className="absolute right-3 top-3 text-muted-foreground"
      >
        <X className="w-4 h-4" />
      </button>
      <p className="font-medium text-foreground text-sm pr-6 mb-3">
        What made tracking difficult these last few days?
      </p>
      <div className="flex flex-wrap gap-2">
        {TRACKING_FRICTION_REASONS.map((r) => (
          <button
            key={r.value}
            onClick={() => record(r.value)}
            className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary"
          >
            {r.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
};
