import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Loader2, User, Bot, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { label: "🥗 Diet advice", prompt: "What should I eat today to reach my calorie goal?" },
  { label: "💪 Muscle gain", prompt: "Give me tips for building muscle with my current diet" },
  { label: "🔥 Weight loss", prompt: "How can I speed up my weight loss safely?" },
  { label: "🍎 Food swap", prompt: "Suggest healthy alternatives to junk food cravings" },
  { label: "🏃 Pre-workout", prompt: "What should I eat before a workout?" },
  { label: "😴 Recovery", prompt: "Best foods for post-workout recovery?" },
];

const AskAI = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, dailySummary } = useUserData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build context for AI
      const context = {
        goal: profile?.goal || "general_health",
        calorieTarget: profile?.calorie_target || 2000,
        caloriesConsumed: dailySummary.totalCalories,
        caloriesRemaining: Math.max(0, (profile?.calorie_target || 2000) - dailySummary.totalCalories),
        proteinTarget: profile?.protein_target || 120,
        proteinConsumed: dailySummary.totalProtein,
        activityLevel: profile?.activity_level || "moderate",
        dietPreference: profile?.diet_preference || "none",
        allergies: profile?.allergies || [],
      };

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          message: messageText,
          context,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I'm sorry, I couldn't process that request. Please try again.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <div className="container max-w-lg mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">Nutrio AI</h1>
            <p className="text-xs text-muted-foreground">Your personal nutrition assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-lg mx-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="space-y-6">
              {/* Welcome */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Hey {profile?.full_name?.split(" ")[0] || "there"}! 👋</h2>
                <p className="text-muted-foreground">
                  I'm your AI nutrition coach. Ask me anything about diet, fitness, or healthy eating!
                </p>
              </motion.div>

              {/* Quick Prompts */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Try asking about:</p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map((item, index) => (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleQuickPrompt(item.prompt)}
                      className="p-3 rounded-xl bg-card border border-border text-left hover:bg-muted transition-colors"
                    >
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Context Info */}
              {profile && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-muted/50 rounded-xl p-4"
                >
                  <p className="text-sm text-muted-foreground">
                    📊 I know your goal is <span className="font-medium text-foreground">{profile.goal?.replace("_", " ")}</span> and you have{" "}
                    <span className="font-medium text-foreground">
                      {Math.max(0, (profile.calorie_target || 2000) - dailySummary.totalCalories)} kcal
                    </span>{" "}
                    remaining today. Ask me personalized advice!
                  </p>
                </motion.div>
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
                    exit={{ opacity: 0 }}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md p-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-20 left-0 right-0 bg-background border-t border-border p-4">
        <div className="container max-w-lg mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about nutrition..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AskAI;
