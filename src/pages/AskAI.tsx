import { useEffect, useState } from "react";
import { Mic, ThumbsDown, ThumbsUp } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { VellynLogo } from "@/components/VellynLogo";
import { HeyVellynConversation } from "@/components/capture/HeyVellynConversation";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { useAskVellyn } from "@/hooks/useAskVellyn";
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
  const { messages, loading, ask, rate } = useAskVellyn();
  const [input, setInput] = useState("");
  const [location, setLocation] = useState<string | null>(null);
  const [intent, setIntent] = useState<string | null>(null);
  const [rated, setRated] = useState<Record<string, boolean>>({});
  const [voiceOpen, setVoiceOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const send = (text: string) => {
    if (!text.trim() || loading) return;
    void ask(text, { location, intent });
    setInput("");
  };

  const chip = (active: boolean) =>
    `press rounded-full border px-3 py-2 text-xs ${
      active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
    }`;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Shimmer className="text-sm">Opening Ask Vellyn…</Shimmer>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col pb-20">
      <header className="shrink-0 border-b border-border bg-card px-4 py-3">
        <div className="container max-w-lg mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 p-1.5 flex items-center justify-center">
            <VellynLogo className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground">Ask Vellyn</h1>
            <p className="text-xs text-muted-foreground">Real food decisions, in real situations</p>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 container max-w-lg mx-auto w-full">
        <Conversation className="h-full">
          <ConversationContent className="gap-4 px-4 py-4 pb-6">
            <section aria-label="Conversation context" className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Where are you?</p>
                <div className="flex flex-wrap gap-2">
                  {ASK_LOCATIONS.map((item) => (
                    <button
                      type="button"
                      key={item.value}
                      onClick={() => setLocation(location === item.value ? null : item.value)}
                      className={chip(location === item.value)}
                    >
                      {item.emoji} {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">What do you need help with?</p>
                <div className="flex flex-wrap gap-2">
                  {ASK_INTENTS.map((item) => (
                    <button
                      type="button"
                      key={item.value}
                      onClick={() => {
                        setIntent(item.value);
                        send(item.label);
                      }}
                      className={chip(intent === item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {messages.length === 0 && (
              <section className="space-y-4 py-2">
                <div className="text-center py-2">
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    Hey {profile?.full_name?.split(" ")[0] || "there"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Tell me where you are and I’ll suggest a few realistic options.
                  </p>
                </div>
                <div className="grid gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      type="button"
                      key={prompt}
                      onClick={() => send(prompt)}
                      className="press rounded-lg border border-border bg-card p-3 text-left text-sm text-foreground"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
                {profile && (
                  <p className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                    Your goal is <span className="font-medium text-foreground">{profile.goal?.replace("_", " ")}</span>, with{" "}
                    <span className="font-medium text-foreground">
                      {Math.max(0, (profile.calorie_target || 2000) - dailySummary.totalCalories)} kcal
                    </span>{" "}
                    left today. General nutrition guidance only — not medical advice.
                  </p>
                )}
              </section>
            )}

            {messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <div className={message.role === "assistant" ? "flex items-start gap-2" : undefined}>
                  {message.role === "assistant" && (
                    <div className="mt-0.5 w-8 h-8 shrink-0 rounded-lg bg-primary/10 p-1">
                      <VellynLogo className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className={message.role === "assistant" ? "min-w-0 flex-1" : undefined}>
                    <MessageContent className={message.role === "user" ? "bg-primary text-primary-foreground" : undefined}>
                      <MessageResponse>{message.content}</MessageResponse>
                    </MessageContent>
                    {message.role === "assistant" && message.interactionId && !rated[message.id] && (
                      <MessageActions className="mt-1">
                        <MessageAction
                          tooltip="This helped"
                          onClick={() => {
                            if (!message.interactionId) return;
                            void rate(message.interactionId, true);
                            setRated((current) => ({ ...current, [message.id]: true }));
                          }}
                        >
                          <ThumbsUp />
                        </MessageAction>
                        <MessageAction
                          tooltip="This didn’t help"
                          onClick={() => {
                            if (!message.interactionId) return;
                            void rate(message.interactionId, false);
                            setRated((current) => ({ ...current, [message.id]: true }));
                          }}
                        >
                          <ThumbsDown />
                        </MessageAction>
                      </MessageActions>
                    )}
                  </div>
                </div>
              </Message>
            ))}

            {loading && (
              <Message from="assistant">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 p-1">
                    <VellynLogo className="w-full h-full object-contain" />
                  </div>
                  <Shimmer className="text-sm">Vellyn is thinking…</Shimmer>
                </div>
              </Message>
            )}
          </ConversationContent>
          <ConversationScrollButton aria-label="Scroll to latest message" />
        </Conversation>
      </main>

      <div className="shrink-0 border-t border-border bg-background px-4 py-3">
        <div className="container max-w-lg mx-auto">
          <PromptInput
            onSubmit={({ text }) => send(text)}
            className="rounded-lg bg-card"
          >
            <PromptInputTextarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask Vellyn anything about food right now…"
              disabled={loading}
              className="min-h-12"
            />
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputButton
                  onClick={() => setVoiceOpen(true)}
                  disabled={loading}
                  tooltip="Talk hands-free with Vellyn"
                  aria-label="Start a hands-free conversation with Vellyn"
                >
                  <Mic />
                </PromptInputButton>
              </PromptInputTools>
              <PromptInputSubmit
                status={loading ? "submitted" : "ready"}
                disabled={!input.trim() || loading}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>

      <HeyVellynConversation open={voiceOpen} onClose={() => setVoiceOpen(false)} />
      <BottomNav />
    </div>
  );
};

export default AskAI;