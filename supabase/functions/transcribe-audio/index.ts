import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { clientFor, corsHeaders } from "../_shared/userContext.ts";

// Speech-to-text for "Tell Nutrio" and Ask Nutrio voice input.
// Client uploads a complete WAV file (base64) recorded via the Web Audio API.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const supabase = clientFor(req);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return json({ error: "Not authenticated" }, 401);

    const { audio } = await req.json();
    if (typeof audio !== "string" || audio.length < 1000) {
      return json({ error: "That recording was empty — please try again." }, 400);
    }

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "Voice input is not configured right now." }, 500);

    const bytes = Uint8Array.from(atob(audio), (c) => c.charCodeAt(0));
    if (bytes.byteLength > 20 * 1024 * 1024) {
      return json({ error: "That recording is too long — try a shorter one." }, 400);
    }

    const form = new FormData();
    form.append("model", "google/gemini-3.5-transcribe");
    form.append("file", new Blob([bytes], { type: "audio/wav" }), "recording.wav");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("transcription error", res.status, detail);
      if (res.status === 429) return json({ error: "Nutrio is busy — try again in a moment." }, 429);
      if (res.status === 402) return json({ error: "AI credits have run out." }, 402);
      return json({ error: "Nutrio couldn't hear that — please try again." }, 502);
    }

    const data = await res.json();
    const text: string = (data?.text ?? "").trim();
    if (!text) return json({ error: "Nutrio didn't catch any words — please try again." }, 422);
    return json({ text });
  } catch (e) {
    console.error("transcribe-audio", e);
    return json({ error: "Something went wrong with voice input." }, 500);
  }
});
