import { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Star, Loader2, Plus, Send } from "lucide-react";
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
  isLoading?: boolean;
  onLogFood?: () => void;
}

export const AIMealModal = forwardRef<HTMLDivElement, AIMealModalProps>(({
  isOpen,
  onClose,
  mealType,
  explanation,
  options,
  followUpQuestion,
  onSelectMeal,
  isLoading = false,
  onLogFood,
}, ref) => {
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
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] px-5 py-5">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Getting AI suggestions...</p>
                </div>
              ) : (
                <>
                  {/* AI Explanation */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-start gap-2 mb-4"
                  >
                    <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {explanation.split(/[.!?]/)[0]}.
                    </p>
                  </motion.div>

                  {/* Meal Options */}
                  <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide -mx-5 px-5 pb-3">
                    {options.map((option, index) => (
                      <motion.button
                        key={option.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + index * 0.1 }}
                        onClick={() => onSelectMeal(option)}
                        className="snap-card flex-[0_0_82%] max-w-xs bg-card rounded-2xl overflow-hidden text-left border border-border/60 shadow-elevated transition-all active:scale-[0.98] group"
                      >
                        <div className="h-32 bg-primary/10 flex items-center justify-center text-6xl" aria-hidden="true">🍽️</div>
                        <div className="p-4 flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">
                                {option.name}
                              </h3>
                              {option.isNutrio && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-nutrio-yellow bg-nutrio-yellow/10 px-2 py-0.5 rounded-full">
                                  <Star className="w-3 h-3" />
                                  AI-Preferred
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                              {option.description.split(/[.!?]/)[0]}.
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
                            <span className="sr-only">Choose meal</span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Log Food Button */}
                  {onLogFood && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-4"
                    >
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={onLogFood}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Log custom food instead
                      </Button>
                    </motion.div>
                  )}

                  {/* Follow-up Question */}
                  {followUpQuestion && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-6"
                    >
                      <p className="text-sm text-muted-foreground mb-3">
                        {followUpQuestion}
                      </p>
                      <div className="flex items-center gap-2 rounded-xl border border-input bg-background p-1.5 focus-within:ring-2 focus-within:ring-ring">
                        <input className="h-9 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground" placeholder="Type your answer" aria-label="Answer follow-up question" />
                        <Button size="icon" className="rounded-lg" aria-label="Send answer">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

AIMealModal.displayName = "AIMealModal";