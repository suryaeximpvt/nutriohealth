import { motion } from "framer-motion";
import { Mic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FoodCapture } from "@/hooks/useFoodCaptures";

interface Props {
  captures: FoodCapture[];
  onOpen: () => void;
  delay?: number;
}

/** Later-day invitation into the same Tell Nutrio voice agent. */
export const DailyRecapCard = ({ captures, onOpen, delay = 0 }: Props) => {
  const hour = new Date().getHours();
  const meals = new Set(captures.map((capture) => capture.meal_type));
  const recapComplete = captures.some((capture) => capture.capture_method === "recap");
  if (hour < 15 || meals.size >= 2 || recapComplete) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-2xl p-4 shadow-card border border-primary/15"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground text-sm">Quick check-in?</p>
          <p className="text-xs text-muted-foreground">
            Tell Nutrio what you've eaten today and catch up in about 30 seconds.
          </p>
        </div>
      </div>
      <Button className="w-full mt-3" onClick={onOpen}>
        <Mic className="w-4 h-4" /> Tell Nutrio
      </Button>
    </motion.div>
  );
};
