import { motion } from "framer-motion";
import { RefreshCw, Plus, Camera, Loader2, Sparkles, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { AISuggestion } from "@/hooks/useDailyAISuggestions";

interface AISuggestedMealCardProps {
  title: string;
  mealType: "breakfast" | "lunch" | "snacks" | "dinner";
  emoji: string;
  suggestion: AISuggestion | null;
  isLoading: boolean;
  loggedFoods: { id: string; food_name: string; calories: number; protein: number }[];
  onLogMeal: () => void;
  onRegenerate: () => void;
  onAddPhoto: () => void;
  onAddManual?: () => void;
  onDeleteFood: (id: string) => void;
  delay?: number;
}

export const AISuggestedMealCard = ({
  title,
  mealType,
  emoji,
  suggestion,
  isLoading,
  loggedFoods,
  onLogMeal,
  onRegenerate,
  onAddPhoto,
  onAddManual,
  onDeleteFood,
  delay = 0,
}: AISuggestedMealCardProps) => {
  const totalLogged = loggedFoods.reduce((sum, f) => sum + f.calories, 0);
  const hasLogged = loggedFoods.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-2xl shadow-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-border/50">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
          {emoji}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{title}</h3>
          {hasLogged && (
            <p className="text-sm text-muted-foreground">
              {totalLogged} kcal logged
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-primary">AI Pick</span>
        </div>
      </div>

      {/* Logged Foods */}
      {hasLogged && (
        <div className="px-4 pt-3 space-y-2">
          {loggedFoods.map((food) => (
            <div
              key={food.id}
              className="flex items-center justify-between py-2 px-3 bg-primary/5 rounded-xl"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{food.food_name}</p>
                <p className="text-xs text-muted-foreground">
                  {food.calories} kcal • {Math.round(food.protein)}g protein
                </p>
              </div>
              <button
                onClick={() => onDeleteFood(food.id)}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* AI Suggestion */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">
              Nutrio AI is thinking...
            </span>
          </div>
        ) : suggestion ? (
          <div className="space-y-3">
            {/* Suggestion Card */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{suggestion.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{suggestion.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {suggestion.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary">
                      {suggestion.calories} kcal
                    </span>
                    <span className="px-2 py-1 bg-nutrio-blue/10 rounded-full text-xs font-medium text-nutrio-blue">
                      {suggestion.protein}g protein
                    </span>
                    <span className="px-2 py-1 bg-nutrio-amber/10 rounded-full text-xs font-medium text-nutrio-amber">
                      {suggestion.prepTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={onLogMeal}
                className="flex flex-col items-center justify-center gap-1 px-2 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-xs">Log</span>
              </button>
              
              <button
                onClick={onRegenerate}
                disabled={isLoading}
                className="flex flex-col items-center justify-center gap-1 px-2 py-3 bg-muted rounded-xl font-medium hover:bg-muted/80 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                <span className="text-xs">New</span>
              </button>
              
              <button
                onClick={onAddPhoto}
                className="flex flex-col items-center justify-center gap-1 px-2 py-3 bg-nutrio-blue/10 text-nutrio-blue rounded-xl font-medium hover:bg-nutrio-blue/20 transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span className="text-xs">Scan</span>
              </button>

              {onAddManual && (
                <button
                  onClick={onAddManual}
                  className="flex flex-col items-center justify-center gap-1 px-2 py-3 bg-nutrio-purple/10 text-nutrio-purple rounded-xl font-medium hover:bg-nutrio-purple/20 transition-colors"
                >
                  <PenLine className="w-4 h-4" />
                  <span className="text-xs">Manual</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Sparkles className="w-8 h-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              Tap to get AI suggestions
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={onRegenerate}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Generate
              </button>
              <button
                onClick={onAddPhoto}
                className="px-4 py-2 bg-nutrio-blue/10 text-nutrio-blue rounded-xl text-sm font-medium hover:bg-nutrio-blue/20 transition-colors"
              >
                Scan
              </button>
              {onAddManual && (
                <button
                  onClick={onAddManual}
                  className="px-4 py-2 bg-muted rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  Manual
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
