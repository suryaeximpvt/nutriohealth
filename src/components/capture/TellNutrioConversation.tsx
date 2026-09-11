import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Keyboard, Loader2, Mic, Send, Sparkles, Square, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTellNutrio, type TellMode } from "@/hooks/useTellNutrio";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useNutrioSpeech } from "@/hooks/useNutrioSpeech";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  mode?: TellMode;
}

export const TellNutrioConversation = ({ open, onClose, onSaved, mode = "standard" }: Props) => {
  const agent = useTellNutrio(mode);
  const voice = useVoiceInput();
  const speech = useNutrioSpeech();
  const [typing, setTyping] = useState(false);
  const [typed, setTyped] = useState("");
  // Nutrio has asked for a yes/no. The tap controls must stay on screen even
  // once the microphone reopens, so it can also be confirmed without speaking.
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const busyRef = useRef(false);
  const savedRef = useRef(false);
  const openRef = useRef(open);
  const typingRef = useRef(typing);
  const listenRef = useRef<() => Promise<void>>(async () => {});

  openRef.current = open;
  typingRef.current = typing;

  const listen = useCallback(async () => {
    agent.setError(null);
    speech.stop();
    agent.setState("listening");
    const { error } = await voice.start({
      autoStop: true,
      silenceMs: 1600,
      onEndOfSpeech: () => void finishRef.current(),
    });
    if (error) {
      agent.setError(error);
      agent.setState("idle");
    }
  }, [agent, speech, voice]);

  listenRef.current = listen;

  const deliverReply = useCallback(async (reply: Awaited<ReturnType<typeof agent.send>>) => {
    if (!reply || !openRef.current) return;
    const completedAction = reply.status === "done" && !["question", "smalltalk"].includes(reply.intent);
    setAwaitingConfirm(reply.status === "confirm");
    agent.setState(reply.status === "confirm" ? "confirming" : completedAction ? "done" : "speaking");
    await speech.speak(reply.reply);
    if (openRef.current && !typingRef.current && !completedAction) await listenRef.current();
  }, [agent, speech]);

  const finishTurn = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    agent.setState("transcribing");
    const { text, error } = await voice.stop();
    busyRef.current = false;
    if (error) {
      agent.setError(error);
      agent.setState("idle");
      return;
    }
    if (!text?.trim()) {
      agent.setError("Nutrio didn't catch that — try again.");
      agent.setState("idle");
      return;
    }
    await deliverReply(await agent.send(text));
  }, [agent, deliverReply, voice]);

  const finishRef = useRef(finishTurn);
  finishRef.current = finishTurn;

  useEffect(() => {
    if (!open) return;
    const greeting = mode === "recap"
      ? "Let's quickly catch up. Tell me everything you remember eating and drinking today."
      : "I'm listening. Tell me what you ate, what you did, or ask me anything about your day.";
    agent.begin(greeting);
    savedRef.current = false;
    setTyping(false);
    setTyped("");
    setAwaitingConfirm(false);
    void (async () => {
      await speech.prime();
      agent.setState("speaking");
      await speech.speak(greeting);
      if (openRef.current && !typingRef.current) await listenRef.current();
    })();
    return () => {
      voice.cancel();
      speech.stop();
    };
    // Only reset when the sheet opens or its explicit mode changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode]);

  useEffect(() => {
    if (agent.state === "done" && !savedRef.current) {
      savedRef.current = true;
      voice.cancel();
      onSaved?.();
    }
  }, [agent.state, onSaved, voice]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agent.turns, agent.state]);

  useEffect(() => {
    if (agent.error) toast.error(agent.error);
  }, [agent.error]);

  if (!open) return null;

  const close = () => {
    voice.cancel();
    speech.stop();
    onClose();
  };

  const sendTyped = async () => {
    const value = typed.trim();
    if (!value) return;
    setTyped("");
    voice.cancel();
    speech.stop();
    await deliverReply(await agent.send(value));
  };

  const visibleMeals = agent.meals.length ? agent.meals : agent.draft?.items?.length ? [agent.draft] : [];
  const scale = voice.recording ? 1 + Math.min(voice.level, 0.6) * 0.6 : 1;
  const caption = voice.recording
    ? voice.speechDetected ? "I'm listening…" : "Listening… speak naturally"
    : agent.state === "thinking" ? "Got it — thinking…"
    : agent.state === "transcribing" || voice.transcribing ? "Working out what you said…"
    : agent.state === "saving" ? "Saving that for you…"
    : speech.loading || speech.speaking || agent.state === "speaking" ? "Nutrio is speaking…"
    : agent.state === "done" ? "Done." : "Tap the microphone and tell me what happened";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm">
      <button type="button" aria-label="Close Tell Nutrio" onClick={close} className="absolute inset-0 cursor-default" />
      <div className="relative z-10 w-full max-w-lg bg-card rounded-t-3xl p-5 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg text-foreground">{mode === "recap" ? "Daily recap" : "Tell Nutrio"}</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => {
              void speech.prime();
              if (speech.muted) {
                speech.toggleMuted();
                void speech.replay();
              } else if (!speech.speaking && !speech.loading) {
                void speech.replay();
              } else {
                speech.toggleMuted();
              }
            }} aria-label={speech.muted ? "Turn Nutrio voice on" : speech.speaking ? "Mute Nutrio voice" : "Replay Nutrio's last reply"}>
              {speech.muted ? <VolumeX /> : <Volume2 />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => {
              setTyping((value) => !value);
              voice.cancel();
              speech.stop();
              agent.setState("idle");
            }} aria-label={typing ? "Use the microphone" : "Type instead"}>
              {typing ? <Mic /> : <Keyboard />}
            </Button>
            <Button variant="ghost" size="icon" onClick={close} aria-label="Close" className="-mr-2"><X /></Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 mb-4 min-h-[80px]">
          {agent.turns.map((turn, index) => (
            <div key={index} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${turn.role === "user" ? "ml-auto bg-primary/10 text-foreground" : "bg-muted text-foreground"}`}>
              {turn.content}
            </div>
          ))}
          {agent.state === "thinking" && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Sparkles className="animate-pulse" /> Nutrio is thinking…</div>}
          <div ref={endRef} />
        </div>

        {visibleMeals.length > 0 && (
          <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
            {visibleMeals.map((meal, mealIndex) => {
              const calories = Math.round(meal.items.reduce((sum, item) => sum + (Number(item.calories) || 0), 0));
              return (
                <div key={`${meal.meal_type}-${mealIndex}`} className="bg-muted/50 rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold capitalize text-primary">{meal.meal_type}</span>
                    {calories > 0 && <span className="text-xs text-muted-foreground">about {calories} kcal</span>}
                  </div>
                  <p className="text-sm text-foreground mt-0.5">{meal.items.map((item) => item.name).join(", ")}</p>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground">Nutrition is estimated and can be corrected before saving.</p>
          </div>
        )}

        {agent.state === "done" ? (
          <div className="flex flex-col items-center gap-3 pb-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center"><Check className="w-8 h-8" /></div>
            <p className="text-sm text-muted-foreground">Added to your day.</p>
            <Button size="lg" className="w-full" onClick={close}>Close</Button>
          </div>
        ) : typing ? (
          <div className="flex gap-2 pb-2">
            <Input value={typed} onChange={(event) => setTyped(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void sendTyped()} placeholder="Type what you'd say…" aria-label="Type your message to Nutrio" />
            <Button size="icon" aria-label="Send" disabled={!typed.trim()} onClick={() => void sendTyped()}><Send /></Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 pb-2">
            <Button
              variant={voice.recording ? "default" : "secondary"}
              onClick={() => {
                void speech.prime();
                return voice.recording ? void finishTurn() : void listen();
              }}
              disabled={voice.transcribing || agent.state === "thinking" || agent.state === "saving" || speech.loading || speech.speaking}
              aria-label={voice.recording ? "Stop listening" : "Start listening"}
              style={{ transform: `scale(${scale})` }}
              className="w-24 h-24 rounded-full transition-transform duration-100"
            >
              {voice.transcribing || agent.state === "thinking" || agent.state === "saving" || speech.loading ? <Loader2 className="w-9 h-9 animate-spin" /> : voice.recording ? <Square className="w-8 h-8" /> : <Mic className="w-10 h-10" />}
            </Button>
            <p className="text-sm text-muted-foreground text-center">{caption}</p>
            {speech.error && <p className="text-xs text-destructive text-center">{speech.error} The written reply is still available.</p>}
            {(agent.state === "confirming" || awaitingConfirm) && agent.state !== "thinking" && agent.state !== "saving" && (
              <div className="grid grid-cols-3 gap-2 w-full">
                <Button variant="outline" size="lg" onClick={close}>Cancel</Button>
                <Button variant="outline" size="lg" onClick={() => { setAwaitingConfirm(false); voice.cancel(); speech.stop(); setTyping(true); }}>Correct</Button>
                <Button size="lg" onClick={async () => {
                  void speech.prime();
                  voice.cancel();
                  speech.stop();
                  setAwaitingConfirm(false);
                  await deliverReply(await agent.confirm());
                }}>Confirm</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};