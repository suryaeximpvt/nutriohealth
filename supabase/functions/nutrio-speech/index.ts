import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { clientFor, corsHeaders } from "../_shared/userContext.ts";

const MAX_TEXT_LENGTH = 1200;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const supabase = clientFor(req);
    const { data } = await supabase.auth.getUser();
    if (!data.user) return json({ error: "Please sign in again to use Nutrio voice." }, 401);

    const body = await req.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    // "mp3" returns one complete audio file (most reliable in mobile browsers).
    // "pcm" keeps the low-latency streaming path for desktop.
    const format = body?.format === "pcm" ? "pcm" : "mp3";
    if (!text) return json({ error: "There is nothing for Nutrio to say." }, 400);
    if (text.length > MAX_TEXT_LENGTH) return json({ error: "That reply is too long to read aloud." }, 400);

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "Nutrio voice is not configured right now." }, 401);

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input: text,
        voice: "alloy",
        instructions: "Warm, concise British nutrition coach. Friendly, natural, supportive and never judgemental.",
        ...(format === "pcm"
          ? { stream_format: "sse", response_format: "pcm" }
          : { stream_format: "audio", response_format: "mp3" }),
      }),
    });

    if (!upstream.ok) {
      const details = await upstream.text().catch(() => "");
      console.error("nutrio-speech gateway", upstream.status, details);
      let message = "Nutrio couldn't speak just now. You can continue using the transcript.";
      if (upstream.status === 402) message = "Nutrio voice is paused until AI credits are added.";
      if (upstream.status === 403) message = "Nutrio voice is currently disabled for this workspace.";
      if (upstream.status === 429) message = "Nutrio voice is busy. Please wait a moment and try again.";
      return json({ error: message, details }, upstream.status);
    }

    if (format === "mp3") {
      const audio = await upstream.arrayBuffer();
      console.log("nutrio-speech mp3 bytes", audio.byteLength);
      return new Response(audio, {
        headers: { ...corsHeaders, "Content-Type": "audio/mpeg", "Cache-Control": "no-cache" },
      });
    }

    return new Response(upstream.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (error) {
    console.error("nutrio-speech", error);
    return json({ error: "Nutrio couldn't speak just now. You can continue using the transcript." }, 500);
  }
});
