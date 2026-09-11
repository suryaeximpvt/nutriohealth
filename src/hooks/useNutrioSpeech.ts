import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const SAMPLE_RATE = 24000;

const decodeBase64 = (value: string) => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

export const useNutrioSpeech = () => {
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const abortRef = useRef<AbortController | null>(null);
  const playheadRef = useRef(0);
  const pendingRef = useRef(new Uint8Array(0));
  const generationRef = useRef(0);
  const mutedRef = useRef(false);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const ensureContext = useCallback(async () => {
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) throw new Error("Audio playback is not supported on this device.");
    const context = contextRef.current ?? new AudioCtx({ sampleRate: SAMPLE_RATE });
    contextRef.current = context;
    if (context.state === "suspended") await context.resume();
    return context;
  }, []);

  const prime = useCallback(async () => {
    try {
      await ensureContext();
    } catch {
      // The transcript remains available when a browser blocks audio.
    }
  }, [ensureContext]);

  const stop = useCallback(() => {
    generationRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    sourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch {
        // Already stopped.
      }
    });
    sourcesRef.current.clear();
    playheadRef.current = 0;
    pendingRef.current = new Uint8Array(0);
    setLoading(false);
    setSpeaking(false);
  }, []);

  const schedule = useCallback(async (incoming: Uint8Array, generation: number) => {
    if (mutedRef.current || generation !== generationRef.current) return;
    const context = await ensureContext();
    const combined = new Uint8Array(pendingRef.current.length + incoming.length);
    combined.set(pendingRef.current);
    combined.set(incoming, pendingRef.current.length);
    const usable = combined.length - (combined.length % 2);
    pendingRef.current = combined.slice(usable);
    if (!usable) return;

    const view = new DataView(combined.buffer, combined.byteOffset, usable);
    const floats = new Float32Array(usable / 2);
    for (let i = 0; i < floats.length; i += 1) floats[i] = view.getInt16(i * 2, true) / 32768;
    const buffer = context.createBuffer(1, floats.length, SAMPLE_RATE);
    buffer.copyToChannel(floats, 0);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    sourcesRef.current.add(source);
    source.onended = () => sourcesRef.current.delete(source);
    const startAt = playheadRef.current
      ? Math.max(playheadRef.current, context.currentTime)
      : context.currentTime + 0.08;
    source.start(startAt);
    playheadRef.current = startAt + buffer.duration;
    setSpeaking(true);
  }, [ensureContext]);

  const speak = useCallback(async (text: string): Promise<{ error?: string }> => {
    stop();
    setError(null);
    if (mutedRef.current || !text.trim()) return {};
    const generation = generationRef.current;
    const controller = new AbortController();
    abortRef.current = controller;
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
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Nutrio couldn't speak just now.");
      }

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const event of events) {
          const line = event.split("\n").find((part) => part.startsWith("data:"));
          if (!line) continue;
          const payload = JSON.parse(line.slice(5).trim()) as { type?: string; audio?: string };
          if (payload.type === "speech.audio.delta" && payload.audio) {
            await schedule(decodeBase64(payload.audio), generation);
          }
        }
      }

      const context = contextRef.current;
      if (context && playheadRef.current > context.currentTime) {
        await new Promise<void>((resolve) => {
          const wait = Math.max(0, (playheadRef.current - context.currentTime) * 1000 + 80);
          window.setTimeout(resolve, wait);
        });
      }
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
  }, [schedule, stop]);

  const toggleMuted = useCallback(() => {
    setMuted((current) => {
      if (!current) stop();
      return !current;
    });
  }, [stop]);

  useEffect(() => () => {
    stop();
    void contextRef.current?.close();
    contextRef.current = null;
  }, [stop]);

  return { loading, speaking, muted, error, speak, stop, prime, toggleMuted };
};