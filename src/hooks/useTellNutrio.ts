import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuickCapture } from "./useQuickCapture";
import { useMealStatus } from "./useMealStatus";
import { useAuth } from "./useAuth";
import { guessMealType, type MealType } from "@/lib/foodSnap";
import type { ParsedMeal } from "@/lib/capture";

export type TellState = "idle" | "listening" | "thinking" | "speaking" | "confirming" | "saving" | "done";

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
  activity: { name?: string; minutes?: number } | null;
}

/**
 * Conversation engine for Tell Nutrio: turns, working draft, intent and
 * completing the action (meal, skipped meal, activity or a question).
 */
export const useTellNutrio = () => {
  const { user } = useAuth();
  const { save } = useQuickCapture();
  const { setStatus } = useMealStatus();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [state, setState] = useState<TellState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [intent, setIntent] = useState<TellIntent>("smalltalk");
  const draftRef = useRef<ParsedMeal | null>(null);
  const activityRef = useRef<{ name?: string; minutes?: number } | null>(null);
  const [draft, setDraft] = useState<ParsedMeal | null>(null);

  const reset = useCallback(() => {
    setTurns([]);
    setState("idle");
    setError(null);
    setIntent("smalltalk");
    setDraft(null);
    draftRef.current = null;
    activityRef.current = null;
  }, []);

  const complete = useCallback(
    async (reply: TellReply, history: Turn[]) => {
      setState("saving");
      const d = draftRef.current;

      if (reply.intent === "log_activity" || activityRef.current) {
        const a = activityRef.current ?? reply.activity ?? {};
        if (user) {
          await supabase.from("workout_logs").insert({
            user_id: user.id,
            exercise_name: a.name || "Activity",
            exercise_type: "cardio",
            duration_minutes: Number(a.minutes) || 30,
            intensity: "moderate",
          } as never);
        }
      } else if (reply.intent === "skip_meal") {
        const mealType = (d?.meal_type ?? guessMealType()) as MealType;
        await setStatus(mealType, "skipped", history.at(-2)?.content);
      } else if (d?.items?.length) {
        const { error: saveError } = await save(d, "voice", (d.meal_type ?? guessMealType()) as MealType);
        if (saveError) {
          setError("Nutrio couldn't save that just now.");
          setState("confirming");
          return false;
        }
      }

      setState("done");
      return true;
    },
    [save, setStatus, user],
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
          body: { turns: history, draft: draftRef.current },
        });
        if (fnError || data?.error) {
          setError((data?.error as string) ?? "Nutrio couldn't answer just now.");
          setState("idle");
          return;
        }

        const reply = data as TellReply;
        setIntent(reply.intent);
        if (reply.draft?.items?.length) {
          draftRef.current = reply.draft;
          setDraft(reply.draft);
        }
        if (reply.activity) activityRef.current = reply.activity;

        const withReply: Turn[] = [...history, { role: "assistant", content: reply.reply }];
        setTurns(withReply);

        if (reply.status === "done") {
          if (reply.intent === "question" || reply.intent === "smalltalk") {
            setState("speaking");
          } else {
            await complete(reply, withReply);
          }
        } else if (reply.status === "confirm") {
          setState("confirming");
        } else {
          setState("speaking");
        }
      } catch {
        setError("Nutrio couldn't answer just now.");
        setState("idle");
      }
    },
    [turns, complete],
  );

  /** User tapped "Yes" instead of speaking the confirmation. */
  const confirm = useCallback(async () => {
    const reply: TellReply = {
      intent: activityRef.current ? "log_activity" : draftRef.current?.items?.length ? "log_meal" : "smalltalk",
      reply: "",
      status: "done",
      draft: draftRef.current,
      activity: activityRef.current,
    };
    const ok = await complete(reply, turns);
    if (ok) {
      setTurns((t) => [
        ...t,
        { role: "assistant", content: "Done — I've added that to your day." },
      ]);
    }
  }, [complete, turns]);

  return {
    turns,
    state,
    setState,
    error,
    setError,
    intent,
    draft,
    send,
    confirm,
    reset,
  };
};
