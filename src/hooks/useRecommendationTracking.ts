import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useLifestyleMode } from "./useLifestyleMode";
import { useUserData } from "./useUserData";

export type RecEventType =
  | "shown"
  | "opened"
  | "accepted"
  | "dismissed"
  | "followed"
  | "partially_followed"
  | "not_followed";

export type RecRating = "helpful" | "okay" | "not_helpful";

export const REJECTION_REASONS = [
  { value: "disliked_food", label: "I didn't like the food" },
  { value: "no_time", label: "Didn't have time" },
  { value: "ingredients_unavailable", label: "Ingredients unavailable" },
  { value: "too_expensive", label: "Too expensive" },
  { value: "routine_mismatch", label: "Didn't fit my routine" },
  { value: "culture_mismatch", label: "Didn't fit my culture" },
  { value: "too_difficult", label: "Too difficult" },
  { value: "goal_mismatch", label: "Didn't match my goal" },
  { value: "other", label: "Other" },
];

export interface TrackPayload {
  recommendationId?: string | null;
  recommendationType: string;
  content?: Record<string, unknown> | null;
  mealType?: string | null;
}

/** Records what the user does with each recommendation so future ones can adapt. */
export const useRecommendationTracking = () => {
  const { user } = useAuth();
  const { activeMode } = useLifestyleMode();
  const { profile } = useUserData();
  const shownOnce = useRef<Set<string>>(new Set());

  const track = useCallback(
    async (eventType: RecEventType, p: TrackPayload) => {
      if (!user) return;
      await supabase.from("recommendation_events").insert({
        user_id: user.id,
        recommendation_id: p.recommendationId ?? null,
        recommendation_type: p.recommendationType,
        recommendation_content: (p.content ?? null) as never,
        event_type: eventType,
        meal_type: p.mealType ?? null,
        goal_context: (profile as { goal?: string } | null)?.goal ?? null,
        lifestyle_mode_context: activeMode?.mode_key ?? null,
      });
    },
    [user, activeMode, profile],
  );

  /** Fires "shown" only once per recommendation per session. */
  const trackShown = useCallback(
    (p: TrackPayload) => {
      const key = `${p.recommendationType}:${p.recommendationId ?? JSON.stringify(p.content)}`;
      if (shownOnce.current.has(key)) return;
      shownOnce.current.add(key);
      void track("shown", p);
    },
    [track],
  );

  const submitFeedback = useCallback(
    async (
      p: TrackPayload,
      rating: RecRating,
      rejectionReason?: string | null,
      note?: string | null,
    ) => {
      if (!user) return;
      await supabase.from("recommendation_feedback").insert({
        user_id: user.id,
        recommendation_id: p.recommendationId ?? null,
        recommendation_type: p.recommendationType,
        recommendation_content: (p.content ?? null) as never,
        meal_type: p.mealType ?? null,
        rating,
        rejection_reason: rejectionReason ?? null,
        note: note ?? null,
        lifestyle_mode_context: activeMode?.mode_key ?? null,
      });
      void supabase.functions.invoke("behaviour-analysis");
    },
    [user, activeMode],
  );

  return { track, trackShown, submitFeedback };
};
