import { motion } from "framer-motion";
import { Camera, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FoodCapture } from "@/hooks/useFoodCaptures";
import { isoDate } from "@/lib/capture";

interface Props {
  captures: FoodCapture[];
  onSnap: () => void;
  delay?: number;
}

/** Gentle, optional nudge: just one photo today is enough. */
export const OnePhotoChallengeCard = ({ captures, onSnap, delay = 0 }: Props) => {
  const today = isoDate();
  const done = captures.some((c) => c.capture_date === today && !!c.photo_path);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-2xl p-4 shadow-card"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          {done ? <Check className="w-5 h-5 text-primary" /> : <Camera className="w-5 h-5 text-primary" />}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground text-sm">One photo challenge</p>
          <p className="text-xs text-muted-foreground">
            {done
              ? "Great — one photo is enough for today."
              : "Help Nutrio understand your meals better today."}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">{done ? "1 / 1" : "0 / 1"}</span>
      </div>

      {!done && (
        <Button variant="outline" size="lg" className="w-full mt-3" onClick={onSnap}>
          Take one food photo
        </Button>
      )}
    </motion.div>
  );
};
