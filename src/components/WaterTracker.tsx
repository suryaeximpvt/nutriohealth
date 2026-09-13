import { motion } from "framer-motion";
import { Droplets, Plus, Minus } from "lucide-react";

interface WaterTrackerProps {
  current: number;
  target: number;
  onAdd: () => void;
  onRemove: () => void;
}

export const WaterTracker = ({
  current,
  target,
  onAdd,
  onRemove,
}: WaterTrackerProps) => {
  const progress = Math.min((current / target) * 100, 100);
  const glasses = Math.round(current / 250);
  const targetGlasses = Math.round(target / 250);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-nutrio-blue/10 flex items-center justify-center">
            <Droplets className="w-4 h-4 text-nutrio-blue" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Water</h3>
            <p className="text-xs text-muted-foreground">
              {glasses}/{targetGlasses} glasses
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onRemove}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={onAdd}
            className="w-8 h-8 rounded-full bg-nutrio-blue text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-nutrio-blue"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
};
