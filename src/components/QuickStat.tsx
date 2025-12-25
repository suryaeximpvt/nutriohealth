import { motion } from "framer-motion";

interface QuickStatProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color?: string;
  onClick?: () => void;
  delay?: number;
}

export const QuickStat = ({
  icon,
  value,
  label,
  color = "hsl(var(--primary))",
  onClick,
  delay = 0,
}: QuickStatProps) => {
  return (
    <motion.button
      onClick={onClick}
      className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:shadow-elevated active:scale-[0.98] flex-1"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>
      <div className="text-center">
        <p className="font-bold text-lg text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </motion.button>
  );
};
