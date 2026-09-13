import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type MacroTone = "primary" | "strong" | "medium" | "soft";

interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  /** One consistent Tailwind-token approach instead of mixed raw colour values. */
  tone?: MacroTone;
}

const TONE_CLASS: Record<MacroTone, string> = {
  primary: "bg-primary",
  strong: "bg-foreground/75",
  medium: "bg-foreground/50",
  soft: "bg-foreground/30",
};

export const MacroBar = ({ label, current, target, unit = "g", tone = "strong" }: MacroBarProps) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold text-foreground">
          {current}
          <span className="text-muted-foreground">
            /{target}
            {unit}
          </span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn("h-full rounded-full", TONE_CLASS[tone])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
    </div>
  );
};
