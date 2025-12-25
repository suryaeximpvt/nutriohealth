import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface MealTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mealType: "breakfast" | "lunch" | "snacks" | "dinner") => void;
}

const MEAL_OPTIONS = [
  { type: "breakfast" as const, emoji: "🌅", title: "Breakfast" },
  { type: "lunch" as const, emoji: "☀️", title: "Lunch" },
  { type: "snacks" as const, emoji: "🍎", title: "Snacks" },
  { type: "dinner" as const, emoji: "🌙", title: "Dinner" },
];

export const MealTypeSelector = ({
  isOpen,
  onClose,
  onSelect,
}: MealTypeSelectorProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-2xl p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-foreground text-lg">
              Which meal is this for?
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Meal Options */}
          <div className="grid grid-cols-2 gap-3">
            {MEAL_OPTIONS.map((meal) => (
              <motion.button
                key={meal.type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(meal.type)}
                className="flex flex-col items-center gap-2 p-5 bg-muted/50 rounded-2xl hover:bg-primary/10 transition-colors"
              >
                <span className="text-4xl">{meal.emoji}</span>
                <span className="font-medium text-foreground">{meal.title}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
