import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MealOption {
  name: string;
  description: string;
  calories: number;
  isNutrio?: boolean;
}

interface AIMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: string;
  explanation: string;
  options: MealOption[];
  followUpQuestion: string;
  onSelectMeal: (meal: MealOption) => void;
}

export const AIMealModal = ({
  isOpen,
  onClose,
  mealType,
  explanation,
  options,
  followUpQuestion,
  onSelectMeal,
}: AIMealModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card z-10 px-6 pt-4 pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {mealType} Ideas
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="w-12 h-1 bg-muted rounded-full mx-auto mt-3" />
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] px-6 py-4">
              {/* AI Explanation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-nutrio-sage-light rounded-xl p-4 mb-5"
              >
                <p className="text-sm text-foreground leading-relaxed">
                  {explanation}
                </p>
              </motion.div>

              {/* Meal Options */}
              <div className="space-y-3">
                {options.map((option, index) => (
                  <motion.button
                    key={option.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.1 }}
                    onClick={() => onSelectMeal(option)}
                    className="w-full glass-card rounded-xl p-4 text-left hover:shadow-elevated transition-all active:scale-[0.98] group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            {option.name}
                          </h3>
                          {option.isNutrio && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-nutrio-amber bg-nutrio-amber/10 px-2 py-0.5 rounded-full">
                              <Star className="w-3 h-3" />
                              AI-Preferred
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="font-bold text-foreground">
                            {option.calories}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            kcal
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Follow-up Question */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-4 border border-border rounded-xl"
              >
                <p className="text-sm text-muted-foreground mb-3">
                  {followUpQuestion}
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1">
                    Yes
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1">
                    No
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
