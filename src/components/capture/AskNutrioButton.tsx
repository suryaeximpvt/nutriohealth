import { useLocation, useNavigate } from "react-router-dom";
import { MessageCircleHeart } from "lucide-react";

const HIDDEN_ON = ["/auth", "/onboarding", "/ask-ai", "/.lovable/oauth/consent"];

/** Persistent Ask Nutrio access from anywhere in the app. */
export const AskNutrioButton = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <button
      onClick={() => navigate("/ask-ai")}
      aria-label="Ask Nutrio"
      className="fixed right-4 bottom-28 z-40 h-14 px-4 rounded-full bg-primary text-primary-foreground shadow-card flex items-center gap-2 active:scale-95 transition-transform"
    >
      <MessageCircleHeart className="w-6 h-6" />
      <span className="font-semibold text-sm">Ask Nutrio</span>
    </button>
  );
};
