import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Camera, Sparkles, ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FoodLog {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  quantity: number;
}

interface MealSectionProps {
  title: string;
  mealType: "breakfast" | "lunch" | "snacks" | "dinner";
  emoji: string;
  foods: FoodLog[];
  targetCalories: number;
  onAddManual: () => void;
  onAddPhoto: () => void;
  onCustomiseAI: () => void;
  onDeleteFood: (id: string) => void;
  delay?: number;
}

export const MealSection = ({
  title,
  mealType,
  emoji,
  foods,
  targetCalories,
  onAddManual,
  onAddPhoto,
  onCustomiseAI,
  onDeleteFood,
  delay = 0,
}: MealSectionProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0);
  const totalProtein = foods.reduce((sum, f) => sum + Number(f.protein), 0);
  const progress = Math.min((totalCalories / targetCalories) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-2xl shadow-card overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3"
      >
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
          {emoji}
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{totalCalories} / {targetCalories} kcal</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span>{Math.round(totalProtein)}g protein</span>
          </div>
        </div>
        <ChevronRight className={cn(
          "w-5 h-5 text-muted-foreground transition-transform",
          expanded && "rotate-90"
        )} />
      </button>

      {/* Progress Bar */}
      <div className="px-4 pb-3">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: delay + 0.2, duration: 0.5 }}
            className={cn(
              "h-full rounded-full",
              progress >= 100 ? "bg-primary" : "bg-primary/70"
            )}
          />
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-border"
        >
          {/* Logged Foods */}
          {foods.length > 0 && (
            <div className="p-4 space-y-2">
              {foods.map((food) => (
                <div
                  key={food.id}
                  className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-xl"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{food.food_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {food.calories} kcal • {Math.round(Number(food.protein))}g protein
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteFood(food.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-4 pt-0 grid grid-cols-3 gap-2">
            <button
              onClick={onAddManual}
              className="flex flex-col items-center gap-1.5 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">Add Food</span>
            </button>
            
            <button
              onClick={onAddPhoto}
              className="flex flex-col items-center gap-1.5 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 bg-nutrio-blue/10 rounded-lg flex items-center justify-center">
                <Camera className="w-4 h-4 text-nutrio-blue" />
              </div>
              <span className="text-xs font-medium text-foreground">Scan Food</span>
            </button>
            
            <button
              onClick={onCustomiseAI}
              className="flex flex-col items-center gap-1.5 p-3 bg-gradient-to-br from-primary/10 to-nutrio-purple/10 rounded-xl hover:from-primary/20 hover:to-nutrio-purple/20 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-nutrio-purple rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-medium text-foreground">Nutrio AI</span>
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
