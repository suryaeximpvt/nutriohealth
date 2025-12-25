import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";

interface MealCardProps {
  title: string;
  subtitle: string;
  calories?: number;
  icon: React.ReactNode;
  logged?: boolean;
  onClick: () => void;
  delay?: number;
}

export const MealCard = ({
  title,
  subtitle,
  calories,
  icon,
  logged = false,
  onClick,
  delay = 0,
}: MealCardProps) => {
  return (
    <motion.button
      onClick={onClick}
      className="w-full glass-card rounded-xl p-4 flex items-center gap-4 text-left transition-all hover:shadow-elevated active:scale-[0.98]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
      </div>
      {logged && calories ? (
        <div className="text-right">
          <span className="font-semibold text-foreground">{calories}</span>
          <span className="text-sm text-muted-foreground ml-1">kcal</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-primary">
          <Sparkles className="w-4 h-4" />
          <Plus className="w-5 h-5" />
        </div>
      )}
    </motion.button>
  );
};
