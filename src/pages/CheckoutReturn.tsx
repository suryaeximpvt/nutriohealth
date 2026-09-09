import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePremium } from "@/hooks/usePremium";

const CheckoutReturn = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { isPremium, refetch } = usePremium();

  useEffect(() => {
    // The subscription record is written by the payment webhook moments later.
    const timers = [1000, 3000, 6000].map((delay) => setTimeout(() => refetch(), delay));
    return () => timers.forEach(clearTimeout);
  }, [refetch]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl shadow-card p-8 max-w-md w-full text-center"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          {isPremium ? (
            <Check className="w-8 h-8 text-primary" />
          ) : (
            <Crown className="w-8 h-8 text-nutrio-amber" />
          )}
        </div>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
          {sessionId ? "You're all set" : "Nothing to show"}
        </h1>
        <p className="text-muted-foreground mb-6">
          {sessionId
            ? isPremium
              ? "Your Nutrio Premium trial has started. Enjoy unlimited AI coaching."
              : "Thanks! We're confirming your payment — this usually takes a few seconds."
            : "We couldn't find any payment details for this page."}
        </p>
        <Button asChild className="w-full h-12">
          <Link to="/">Back to Nutrio</Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default CheckoutReturn;
