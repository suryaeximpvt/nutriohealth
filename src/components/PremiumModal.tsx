import { motion, AnimatePresence } from "framer-motion";
import { Crown, Check, Sparkles, X, Zap, Brain, Calendar, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePremium } from "@/hooks/usePremium";
import { toast } from "sonner";
import { useState } from "react";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PREMIUM_FEATURES = [
  {
    icon: Brain,
    title: "Unlimited AI Meals",
    description: "Get personalized meal suggestions all day, every day",
  },
  {
    icon: Sparkles,
    title: "AI Coach",
    description: "Personal nutrition coaching powered by AI",
  },
  {
    icon: Calendar,
    title: "Weekly Summaries",
    description: "Detailed AI-powered weekly progress reports",
  },
  {
    icon: TrendingUp,
    title: "Advanced Analytics",
    description: "Deep insights into your nutrition patterns",
  },
  {
    icon: Zap,
    title: "Priority Support",
    description: "Get help faster when you need it",
  },
];

export const PremiumModal = ({ isOpen, onClose }: PremiumModalProps) => {
  const { isPremium, upgradeToPremium, getAISuggestionsRemaining } = usePremium();
  const [upgrading, setUpgrading] = useState(false);
  const suggestionsRemaining = getAISuggestionsRemaining();

  const handleUpgrade = async () => {
    setUpgrading(true);
    const { error } = await upgradeToPremium();
    setUpgrading(false);

    if (error) {
      toast.error("Failed to upgrade. Please try again.");
    } else {
      toast.success("Welcome to Nutrio Premium! 🎉");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-background border-border">
        {/* Premium Header */}
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-nutrio-amber p-6 text-primary-foreground">
          <button
            onClick={onClose}
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

          {!isPremium && (
            <div className="bg-primary-foreground/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-sm">
                <span className="font-semibold">{suggestionsRemaining}</span> AI suggestions remaining today
              </p>
              <p className="text-xs text-primary-foreground/70 mt-1">
                Free users get 3 AI meal suggestions per day
              </p>
            </div>
          )}
        </div>

        {/* Features List */}
        <div className="p-6">
          {isPremium ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">You're a Premium Member!</h3>
              <p className="text-muted-foreground">
                Enjoy unlimited access to all Nutrio AI features
              </p>
            </motion.div>
          ) : (
            <>
              <h3 className="font-semibold text-foreground mb-4">Premium Features</h3>
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

              {/* Pricing */}
              <div className="bg-muted/50 rounded-2xl p-4 mb-4">
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-3xl font-bold text-foreground">£9.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Cancel anytime • 7-day free trial
                </p>
              </div>

              <Button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-nutrio-amber hover:opacity-90 transition-opacity"
              >
                {upgrading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Upgrading...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Start Free Trial
                  </div>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground mt-3">
                By subscribing, you agree to our Terms of Service
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
