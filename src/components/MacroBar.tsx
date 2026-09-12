import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type MacroTone = "protein" | "carbs" | "fat" | "fibre";

const toneClasses: Record<MacroTone, string> = {
  protein: "bg-foreground",
  carbs: "bg-muted-foreground/80",
  fat: "bg-muted-foreground/60",
  fibre: "bg-muted-foreground/40",
};

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  tone?: MacroTone;
  delay?: number;
}

export const MacroBar = ({
  label,
  current,
  target,
  unit = "g",
  tone = "protein",
  delay = 0,
}: MacroBarProps) => {
  const progress = Math.min((current / target) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {current}/{target}{unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", toneClasses[tone])}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay }}
        />
      </div>
    </div>
  );
};
