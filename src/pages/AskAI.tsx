import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, User, MessageCircleHeart, ThumbsUp, ThumbsDown, Mic, Square } from "lucide-react";
import { toast } from "sonner";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { useAskNutrio } from "@/hooks/useAskNutrio";
import { ASK_INTENTS, ASK_LOCATIONS } from "@/lib/capture";
import { useNavigate } from "react-router-dom";

const QUICK_PROMPTS = [
  "I'm hungry. What can I eat now?",
  "I had a heavy lunch. What should I eat for dinner?",
  "What should I buy at the supermarket?",
  "What's a better option at the pub?",
];

const AskAI = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, dailySummary } = useUserData();
  const { messages, loading, ask, rate } = useAskNutrio();
  const [input, setInput] = useState("");
  const [location, setLocation] = useState<string | null>(null);
  const [intent, setIntent] = useState<string | null>(null);
  const [rated, setRated] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const finishingRef = useRef(false);
  const { recording, transcribing, start, stop } = useVoiceInput();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = (text: string) => {
    if (!text.trim() || loading) return;
    void ask(text, { location, intent });
    setInput("");
  };

  const finishVoice = async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    const { text, error } = await stop();
    finishingRef.current = false;
    if (error) return toast.error(error);
    if (text) send(text);
  };
  const finishVoiceRef = useRef(finishVoice);
  finishVoiceRef.current = finishVoice;

  const toggleVoice = async () => {
    if (transcribing) return;
    if (recording) return void finishVoice();
    // Nutrio stops listening on its own once you've finished speaking.
    const { error } = await start({
      autoStop: true,
      silenceMs: 1600,
      onEndOfSpeech: () => void finishVoiceRef.current(),
    });
    if (error) toast.error(error);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-2 text-xs ${
      active ? "border-primary text-primary bg-primary/10" : "text-muted-foreground"
    }`;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <div className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <div className="container max-w-lg mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageCircleHeart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">Ask Nutrio</h1>
            <p className="text-xs text-muted-foreground">Real food decisions, in real situations</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-lg mx-auto px-4 py-4 space-y-5">
          {/* Where are you? */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Where are you?</p>
            <div className="flex flex-wrap gap-2">
              {ASK_LOCATIONS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLocation(location === l.value ? null : l.value)}
                  className={chip(location === l.value)}
                >
                  {l.emoji} {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">What do you need help with?</p>
            <div className="flex flex-wrap gap-2">
              {ASK_INTENTS.map((i) => (
                <button
                  key={i.value}
                  onClick={() => {
                    setIntent(i.value);
                    send(i.label);
                  }}
                  className={chip(intent === i.value)}
                >
                  {i.label}
                </button>
              ))}
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <h2 className="text-xl font-bold text-foreground mb-1">
                  Hey {profile?.full_name?.split(" ")[0] || "there"} 👋
                </h2>
                <p className="text-muted-foreground text-sm">
                  Tell me where you are and I'll suggest a few realistic options.
                </p>
              </div>

              <div className="grid gap-2">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="p-3 rounded-xl bg-card border border-border text-left text-sm text-foreground"
                  >
                    {p}
                  </button>
                ))}
              </div>

              {profile && (
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">
                    I know your goal is{" "}
                    <span className="font-medium text-foreground">{profile.goal?.replace("_", " ")}</span> and you have{" "}
                    <span className="font-medium text-foreground">
                      {Math.max(0, (profile.calorie_target || 2000) - dailySummary.totalCalories)} kcal
                    </span>{" "}
                    left today. General nutrition guidance only — not medical advice.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MessageCircleHeart className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div className="max-w-[80%]">
                      <div
                        className={`p-3 rounded-2xl ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === "assistant" && message.interactionId && !rated[message.id] && (
                        <div className="flex gap-2 mt-1">
                          <button
                            aria-label="This helped"
                            onClick={() => {
                              void rate(message.interactionId!, true);
                              setRated((r) => ({ ...r, [message.id]: true }));
                            }}
                            className="text-muted-foreground"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button
                            aria-label="This didn't help"
                            onClick={() => {
                              void rate(message.interactionId!, false);
                              setRated((r) => ({ ...r, [message.id]: true }));
                            }}
                            className="text-muted-foreground"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageCircleHeart className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md p-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 bg-background border-t border-border p-4">
        <div className="container max-w-lg mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={recording ? "Listening… tap stop when you're done" : "Ask Nutrio anything about food right now..."}
              className="flex-1"
              disabled={loading || recording || transcribing}
            />
            <Button
              type="button"
              size="icon"
              variant={recording ? "default" : "outline"}
              onClick={toggleVoice}
              disabled={loading || transcribing}
              aria-label={recording ? "Stop and send what you said" : "Speak to Nutrio"}
            >
              {transcribing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : recording ? (
                <Square className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
            <Button type="submit" size="icon" disabled={!input.trim() || loading} aria-label="Send">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AskAI;
