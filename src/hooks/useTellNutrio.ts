import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuickCapture } from "./useQuickCapture";
import { useMealStatus } from "./useMealStatus";
import { useAuth } from "./useAuth";
import { guessMealType, type MealType } from "@/lib/foodSnap";
import type { ParsedMeal } from "@/lib/capture";

export type TellState = "idle" | "listening" | "transcribing" | "thinking" | "speaking" | "confirming" | "saving" | "done";

export interface Turn {
  role: "user" | "assistant";
  content: string;
}

export type TellIntent =
  | "log_meal"
  | "skip_meal"
  | "log_activity"
  | "question"
  | "correction"
  | "smalltalk";

interface TellReply {
  intent: TellIntent;
  reply: string;
  status: "need_more" | "confirm" | "done";
  draft: ParsedMeal | null;
  meals?: ParsedMeal[];
  activity: { name?: string; minutes?: number } | null;
}

export type TellMode = "standard" | "recap";

/**
 * Conversation engine for Tell Nutrio: turns, working draft, intent and
 * completing the action (meal, skipped meal, activity or a question).
 */
export const useTellNutrio = (mode: TellMode = "standard") => {
  const { user } = useAuth();
  const { save } = useQuickCapture();
  const { setStatus } = useMealStatus();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [state, setState] = useState<TellState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [intent, setIntent] = useState<TellIntent>("smalltalk");
  const draftRef = useRef<ParsedMeal | null>(null);
  const mealsRef = useRef<ParsedMeal[]>([]);
  const activityRef = useRef<{ name?: string; minutes?: number } | null>(null);
  const [draft, setDraft] = useState<ParsedMeal | null>(null);

  const reset = useCallback(() => {
    setTurns([]);
    setState("idle");
    setError(null);
    setIntent("smalltalk");
    setDraft(null);
    draftRef.current = null;
    mealsRef.current = [];
    activityRef.current = null;
  }, []);

  const begin = useCallback((greeting?: string) => {
    reset();
    if (greeting) setTurns([{ role: "assistant", content: greeting }]);
  }, [reset]);

  const complete = useCallback(
    async (reply: TellReply, history: Turn[]) => {
      setState("saving");
      const d = draftRef.current;
      const meals = mealsRef.current.length ? mealsRef.current : d?.items?.length ? [d] : [];

      if (reply.intent === "log_activity") {
        const a = activityRef.current ?? reply.activity ?? {};
        if (user) {
          const { error: activityError } = await supabase.from("workout_logs").insert({
            user_id: user.id,
            exercise_name: a.name || "Activity",
            exercise_type: "cardio",
            duration_minutes: Number(a.minutes) || 30,
            intensity: "moderate",
          } as never);
          if (activityError) {
            setError("Nutrio couldn't save that activity just now.");
            setState("confirming");
            return false;
          }
        }
        activityRef.current = null;
      } else if (reply.intent === "skip_meal") {
        const mealType = (d?.meal_type ?? guessMealType()) as MealType;
        const result = await setStatus(mealType, "skipped", history[history.length - 2]?.content);
        if (result?.error) {
          setError("Nutrio couldn't save that skipped meal just now.");
          setState("confirming");
          return false;
        }
      } else if (meals.length) {
        let saved = 0;
        for (const meal of meals) {
          if (!meal.items?.length) continue;
          const method = mode === "recap" || meals.length > 1 ? "recap" : "voice";
          const { error: saveError } = await save(
            meal,
            method,
            (meal.meal_type ?? guessMealType()) as MealType,
          );
          if (!saveError) saved += 1;
        }
        if (saved !== meals.length) {
          setError(saved ? `Nutrio saved ${saved} item${saved === 1 ? "" : "s"}, but couldn't save the rest.` : "Nutrio couldn't save that just now.");
          setState("confirming");
          return false;
        }
      }

      setState("done");
      return true;
    },
    [mode, save, setStatus, user],
  );

  /** Send one user turn (spoken or typed) and get Nutrio's reply. */
  const send = useCallback(
    async (text: string) => {
      const said = text.trim();
      if (!said) return;
      setError(null);
      const history: Turn[] = [...turns, { role: "user", content: said }];
      setTurns(history);
      setState("thinking");

      try {
        const { data, error: fnError } = await supabase.functions.invoke("tell-nutrio", {
          body: { turns: history, draft: draftRef.current, meals: mealsRef.current, mode },
        });
        if (fnError || data?.error) {
          setError((data?.error as string) ?? "Nutrio couldn't answer just now.");
          setState("idle");
          return;
        }

        const reply = data as TellReply;
        setIntent(reply.intent);
        const nextMeals = Array.isArray(reply.meals) ? reply.meals.filter((meal) => meal?.items?.length) : [];
        if (nextMeals.length) mealsRef.current = nextMeals;
        if (reply.draft !== undefined) {
          draftRef.current = reply.draft;
          setDraft(reply.draft);
        }
        activityRef.current = reply.activity ?? null;

        const withReply: Turn[] = [...history, { role: "assistant", content: reply.reply }];
        setTurns(withReply);

        if (reply.status === "done") {
          if (reply.intent === "question" || reply.intent === "smalltalk") {
            setState("speaking");
          } else {
            const saved = await complete(reply, withReply);
            if (!saved) return null;
          }
        } else if (reply.status === "confirm") {
          setState("confirming");
        } else {
          setState("speaking");
        }
        return reply;
      } catch {
        setError("Nutrio couldn't answer just now.");
        setState("idle");
        return null;
      }
    },
    [turns, complete, mode],
  );

  /** User tapped "Yes" instead of speaking the confirmation. */
  const confirm = useCallback(() => send("Yes, that's right."), [send]);

  return {
    turns,
    state,
    setState,
    error,
    setError,
    intent,
    draft,
    meals: mealsRef.current,
    send,
    confirm,
    begin,
    reset,
  };
};
