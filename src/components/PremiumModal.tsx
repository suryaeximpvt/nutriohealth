import { motion } from "framer-motion";
import { Crown, Check, Sparkles, X, Shield, Brain, Calendar, TrendingUp } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePremium } from "@/hooks/usePremium";
import { useAuth } from "@/hooks/useAuth";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { PREMIUM_PRICE_ID, PREMIUM_PRICE_LABEL, PREMIUM_TRIAL_DAYS } from "@/lib/stripe";
import { toast } from "sonner";
import { useState } from "react";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PREMIUM_FEATURES = [
  {
    icon: Brain,
    title: "Unlimited AI suggestions",
    description: "Meal and coaching suggestions all day, every day",
  },
  {
    icon: Calendar,
    title: "Weekly insights",
    description: "Your week reviewed, with the one change worth making",
  },
  {
    icon: TrendingUp,
    title: "Advanced analytics",
    description: "Deep insights into your real food patterns",
  },
  {
    icon: Shield,
    title: "Strict Weight Loss Mode",
    description: "Full accountability programme with photo proof",
  },
];

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";

export const PremiumModal = ({ isOpen, onClose }: PremiumModalProps) => {
  const { user } = useAuth();
  const {
    isPremium,
    isTrialing,
    cancelAtPeriodEnd,
    paymentIssue,
    periodEnd,
    getAISuggestionsRemaining,
    openBillingPortal,
  } = usePremium();
  const [showCheckout, setShowCheckout] = useState(false);
  const [busy, setBusy] = useState(false);
  const suggestionsRemaining = getAISuggestionsRemaining();

  const handleClose = () => {
    setShowCheckout(false);
    onClose();
  };

  const handleStart = () => {
    if (!user) {
      toast.error("Please sign in first to start your trial.");
      return;
    }
    setShowCheckout(true);
  };

  const handleManage = async () => {
    setBusy(true);
    const { error } = await openBillingPortal();
    setBusy(false);
    if (error) toast.error("Couldn't open your billing page. Please try again.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-background border-border max-h-[90vh] overflow-y-auto">
        <PaymentTestModeBanner />

        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-nutrio-amber p-6 text-primary-foreground">
          <button
            onClick={handleClose}
            aria-label="Close premium options"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
              <Crown className="w-8 h-8 text-nutrio-amber" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Nutrio Premium</h2>
              <p className="text-primary-foreground/80 text-sm">Unlock your full potential</p>
            </div>
          </motion.div>

          {!isPremium && !showCheckout && (
            <div className="bg-primary-foreground/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-sm">
                <span className="font-semibold">{suggestionsRemaining}</span> AI suggestions remaining today
              </p>
              <p className="text-xs text-primary-foreground/70 mt-1">
                Free members get 3 AI suggestions per day
              </p>
            </div>
          )}
        </div>

        <div className="p-6">
          {isPremium ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-2"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {isTrialing ? "Your free trial is active" : "You're a Premium member"}
              </h3>
              <p className="text-muted-foreground text-sm mb-1">
                {cancelAtPeriodEnd
                  ? `Premium stays on until ${formatDate(periodEnd)}, then your plan ends.`
                  : isTrialing
                    ? `Free until ${formatDate(periodEnd)}, then ${PREMIUM_PRICE_LABEL} a month.`
                    : `Next payment ${formatDate(periodEnd)} — ${PREMIUM_PRICE_LABEL} a month.`}
              </p>
              {paymentIssue && (
                <p className="text-sm text-destructive mt-3">
                  We couldn't take your last payment. Update your card to keep Premium.
                </p>
              )}
              <Button
                onClick={handleManage}
                disabled={busy}
                variant="outline"
                className="w-full h-12 mt-5"
              >
                {busy ? "Opening..." : "Manage billing"}
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-3">
                Change your card, view receipts or cancel at any time.
              </p>
            </motion.div>
          ) : showCheckout ? (
            <StripeEmbeddedCheckout
              priceId={PREMIUM_PRICE_ID}
              customerEmail={user?.email ?? undefined}
              userId={user?.id}
              returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
            />
          ) : (
            <>
              <h3 className="font-semibold text-foreground mb-4">What you get</h3>
              <div className="space-y-3 mb-6">
                {PREMIUM_FEATURES.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-muted/50 rounded-2xl p-4 mb-4">
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-3xl font-bold text-foreground">{PREMIUM_PRICE_LABEL}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  {PREMIUM_TRIAL_DAYS}-day free trial • Cancel anytime
                </p>
              </div>

              <Button
                onClick={handleStart}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-nutrio-amber hover:opacity-90 transition-opacity"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Start {PREMIUM_TRIAL_DAYS}-day free trial
                </span>
              </Button>

              <p className="text-center text-xs text-muted-foreground mt-3">
                Your card is saved now and charged {PREMIUM_PRICE_LABEL} after the trial unless you cancel.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
