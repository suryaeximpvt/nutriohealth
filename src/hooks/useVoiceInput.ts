import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const TARGET_RATE = 16000;

/** Encode mono Float32 PCM chunks into a complete 16-bit WAV file. */
const encodeWav = (chunks: Float32Array[], sampleRate: number): Blob => {
  const length = chunks.reduce((s, c) => s + c.length, 0);
  const merged = new Float32Array(length);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.length;
  }

  // Downsample to 16 kHz to keep uploads small.
  const ratio = Math.max(1, sampleRate / TARGET_RATE);
  const outLength = Math.floor(merged.length / ratio);
  const samples = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) samples[i] = merged[Math.floor(i * ratio)];
  const rate = Math.round(sampleRate / ratio);

  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (pos: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(pos + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let pos = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    pos += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
};

const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(blob);
  });

/**
 * Reliable microphone capture: records real audio and transcribes it
 * server-side (works on iOS Safari and Android, unlike SpeechRecognition).
 */
export interface VoiceStartOptions {
  /** Stop automatically once the user has clearly finished speaking. */
  autoStop?: boolean;
  /** Silence (ms) after speech before Nutrio decides the sentence is finished. */
  silenceMs?: number;
  /** Called once end-of-speech is detected (the caller then calls stop()). */
  onEndOfSpeech?: () => void;
}

const MAX_RECORDING_MS = 30000;
const MIN_SPEECH_MS = 700;

export const useVoiceInput = () => {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [level, setLevel] = useState(0);
  const [speechDetected, setSpeechDetected] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodeRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const endedRef = useRef(false);

  const cleanup = useCallback(() => {
    try {
      nodeRef.current?.disconnect();
      sourceRef.current?.disconnect();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      void ctxRef.current?.close();
    } catch {
      /* ignore */
    }
    nodeRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    ctxRef.current = null;
    setLevel(0);
    setRecording(false);
  }, []);

  const start = useCallback(async (): Promise<{ error?: string }> => {
    if (recording) return {};
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new Ctx();
      if (ctx.state === "suspended") await ctx.resume();
      ctxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const node = ctx.createScriptProcessor(4096, 1, 1);
      chunksRef.current = [];
      node.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        chunksRef.current.push(new Float32Array(input));
        let peak = 0;
        for (let i = 0; i < input.length; i += 32) peak = Math.max(peak, Math.abs(input[i]));
        setLevel(peak);
      };
      source.connect(node);
      node.connect(ctx.destination);
      sourceRef.current = source;
      nodeRef.current = node;
      setRecording(true);
      return {};
    } catch {
      cleanup();
      return { error: "Nutrio needs microphone access — allow it in your browser settings." };
    }
  }, [recording, cleanup]);

  /** Stops recording and returns the transcript. */
  const stop = useCallback(async (): Promise<{ text?: string; error?: string }> => {
    if (!recording) return {};
    const sampleRate = ctxRef.current?.sampleRate ?? 44100;
    const chunks = chunksRef.current;
    cleanup();
    const blob = encodeWav(chunks, sampleRate);
    if (blob.size < 8000) return { error: "That was too short — hold on and say it again." };

    setTranscribing(true);
    try {
      const audio = await blobToBase64(blob);
      const { data, error } = await supabase.functions.invoke("transcribe-audio", { body: { audio } });
      if (error && !data?.text) return { error: (data?.error as string) ?? "Nutrio couldn't hear that — try again." };
      if (data?.error) return { error: data.error as string };
      return { text: (data?.text as string) ?? "" };
    } catch {
      return { error: "Nutrio couldn't hear that — please try again." };
    } finally {
      setTranscribing(false);
    }
  }, [recording, cleanup]);

  const cancel = useCallback(() => {
    chunksRef.current = [];
    cleanup();
  }, [cleanup]);

  return { recording, transcribing, level, start, stop, cancel };
};
