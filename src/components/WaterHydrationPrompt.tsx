import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WaterHydrationPromptProps {
  lastWaterLogTime: Date | null;
  waterGlasses: number;
  waterTarget: number;
  proteinConsumed: number;
  activityLevel: string;
  onAddWater: (glasses: number) => void;
  onDismiss: () => void;
}

const SESSION_KEY = "nutrio_water_prompt_dismissed";

export const WaterHydrationPrompt = ({
  lastWaterLogTime,
  waterGlasses,
  waterTarget,
  proteinConsumed,
  activityLevel,
  onAddWater,
  onDismiss,
}: WaterHydrationPromptProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    const dismissed = sessionStorage.getItem(SESSION_KEY);
    if (dismissed) {
      setIsVisible(false);
      return;
    }

    // Don't show if goal is nearly achieved (>= 90%)
    if (waterGlasses >= waterTarget * 0.9) {
      setIsVisible(false);
      return;
    }

    // Calculate time since last water log
    const now = new Date();
    let hoursSinceLastLog = 3; // Default to 3 hours if no previous log

    if (lastWaterLogTime) {
      const timeDiff = now.getTime() - lastWaterLogTime.getTime();
      hoursSinceLastLog = timeDiff / (1000 * 60 * 60);
    }

    // Smart reminder frequency based on activity and protein
    let reminderThreshold = 2.5; // Default: 2.5 hours

    // High activity = more frequent reminders
    if (activityLevel === "very_active" || activityLevel === "active") {
      reminderThreshold = 1.5;
    }

    // High protein intake = more frequent reminders
    if (proteinConsumed > 100) {
      reminderThreshold -= 0.5;
    }

    // Show prompt if enough time has passed
    if (hoursSinceLastLog >= reminderThreshold) {
      setIsVisible(true);
    }
  }, [lastWaterLogTime, waterGlasses, waterTarget, proteinConsumed, activityLevel]);

  const handleAddWater = (glasses: number) => {
    onAddWater(glasses);
    sessionStorage.setItem(SESSION_KEY, "true");
    setIsVisible(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "true");
    setIsVisible(false);
    onDismiss();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-4 right-4 max-w-lg mx-auto z-50"
        >
          <div className="bg-card border border-nutrio-blue/30 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-nutrio-blue/10 flex items-center justify-center flex-shrink-0">
                <Droplets className="w-5 h-5 text-nutrio-blue" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">Quick check 💧</h3>
                  <button
                    onClick={handleDismiss}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Have you had water in the last hour?
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddWater(1)}
                    className="flex-1 min-w-[100px] border-nutrio-blue/50 text-nutrio-blue hover:bg-nutrio-blue/10"
                  >
                    Yes, add 1 glass
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddWater(2)}
                    className="flex-1 min-w-[100px] border-nutrio-blue/50 text-nutrio-blue hover:bg-nutrio-blue/10"
                  >
                    Yes, add 2 glasses
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="w-full text-muted-foreground"
                  >
                    Not yet
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
