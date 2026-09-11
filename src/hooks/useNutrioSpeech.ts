import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Nutrio's spoken replies.
 *
 * Audio is generated server-side (never in the browser) and played back through
 * a single long-lived <audio> element. The element is created and "unlocked"
 * during a real user tap (prime), which is what iOS Safari requires before any
 * sound is allowed to play automatically later in the conversation.
 */
export const useNutrioSpeech = () => {
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0);
  const mutedRef = useRef(false);
  const lastTextRef = useRef<string | null>(null);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const element = new Audio();
      element.preload = "auto";
      element.autoplay = false;
      // Play through the loudspeaker rather than the earpiece on iOS.
      element.setAttribute("playsinline", "true");
      element.style.display = "none";
      document.body.appendChild(element);
      audioRef.current = element;
    }
    return audioRef.current;
  }, []);

  const releaseUrl = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  /** Call from a real tap so the browser allows later automatic playback. */
  const prime = useCallback(async () => {
    const element = ensureAudio();
    try {
      // A 100ms silent wav satisfies the gesture requirement on iOS Safari.
      element.src =
        "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=";
      element.muted = true;
      await element.play();
      element.pause();
      element.currentTime = 0;
      element.muted = false;
    } catch {
      element.muted = false;
      // Playback stays possible via the on-screen speaker control.
    }
  }, [ensureAudio]);

  const stop = useCallback(() => {
    generationRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    const element = audioRef.current;
    if (element) {
      element.pause();
      element.removeAttribute("src");
      element.load();
    }
    releaseUrl();
    setLoading(false);
    setSpeaking(false);
  }, [releaseUrl]);

  const play = useCallback(
    async (text: string): Promise<{ error?: string }> => {
      stop();
      setError(null);
      if (mutedRef.current || !text.trim()) return {};
      lastTextRef.current = text;
      const generation = generationRef.current;
      const controller = new AbortController();
      abortRef.current = controller;
      const element = ensureAudio();
      setLoading(true);

      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) throw new Error("Please sign in again to use Nutrio voice.");
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/nutrio-speech`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: anonKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, format: "mp3" }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Nutrio couldn't speak just now.");
        }

        const blob = await response.blob();
        if (generation !== generationRef.current) return {};
        releaseUrl();
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        element.src = url;
        element.muted = false;
        element.volume = 1;

        setLoading(false);
        setSpeaking(true);

        await new Promise<void>((resolve) => {
          const done = () => {
            element.onended = null;
            element.onerror = null;
            resolve();
          };
          element.onended = done;
          element.onerror = done;
          element
            .play()
            .catch(() => {
              // Autoplay blocked: the transcript stays on screen and the user
              // can tap the speaker control to hear the reply.
              setError("Tap the speaker icon to hear Nutrio.");
              done();
            });
        });

        if (generation === generationRef.current) setSpeaking(false);
        return {};
      } catch (caught) {
        if (controller.signal.aborted) return {};
        const message = caught instanceof Error ? caught.message : "Nutrio couldn't speak just now.";
        setError(message);
        setSpeaking(false);
        return { error: message };
      } finally {
        if (generation === generationRef.current) setLoading(false);
      }
    },
    [ensureAudio, releaseUrl, stop],
  );

  const replay = useCallback(async () => {
    if (lastTextRef.current) await play(lastTextRef.current);
  }, [play]);

  const toggleMuted = useCallback(() => {
    setMuted((current) => {
      if (!current) stop();
      return !current;
    });
  }, [stop]);

  useEffect(
    () => () => {
      generationRef.current += 1;
      abortRef.current?.abort();
      audioRef.current?.pause();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    },
    [],
  );

  return { loading, speaking, muted, error, speak: play, replay, stop, prime, toggleMuted };
};
