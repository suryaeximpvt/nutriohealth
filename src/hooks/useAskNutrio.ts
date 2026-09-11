import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AskMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  interactionId?: string | null;
}

/** Personalised Ask Nutrio conversation. Context is built server-side. */
export const useAskNutrio = () => {
  const [messages, setMessages] = useState<AskMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const ask = useCallback(
    async (question: string, opts?: { location?: string | null; intent?: string | null }) => {
      const trimmed = question.trim();
      if (!trimmed || loading) return;

      const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
      setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: trimmed }]);
      setLoading(true);

      try {
        const { data, error } = await supabase.functions.invoke("ask-nutrio", {
          body: { question: trimmed, location: opts?.location ?? null, intent: opts?.intent ?? null, history },
        });
        const content =
          (data?.response as string) ??
          (data?.error as string) ??
          (error ? "Nutrio couldn't answer just now — please try again." : "");
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: "assistant", content, interactionId: data?.interactionId ?? null },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: "assistant", content: "Nutrio couldn't answer just now — please try again." },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading],
  );

  const rate = useCallback(async (interactionId: string, helpful: boolean) => {
    await supabase.from("ask_nutrio_interactions").update({ helpful }).eq("id", interactionId);
  }, []);

  return { messages, loading, ask, rate, reset: () => setMessages([]) };
};
