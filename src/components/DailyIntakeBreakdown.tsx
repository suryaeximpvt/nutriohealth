import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ChevronDown, ChevronUp, Flame, Beef, Wheat, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FoodLog {
  id: string;
  meal_type: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  quantity: number;
  unit: string;
  logged_at: string;
}

interface DailyIntakeBreakdownProps {
  isOpen: boolean;
  onClose: () => void;
  meals: {
    breakfast: FoodLog[];
    lunch: FoodLog[];
    snacks: FoodLog[];
    dinner: FoodLog[];
  };
  caloriesConsumed: number;
  caloriesRemaining: number;
  calorieTarget: number;
  onDeleteFood: (id: string) => Promise<{ error: string | null }>;
}

const MEAL_CONFIG = [
  { type: "breakfast", title: "Breakfast", emoji: "🌅", color: "from-amber-500/20 to-orange-500/20" },
  { type: "lunch", title: "Lunch", emoji: "☀️", color: "from-yellow-500/20 to-amber-500/20" },
  { type: "snacks", title: "Snacks", emoji: "🍎", color: "from-green-500/20 to-emerald-500/20" },
  { type: "dinner", title: "Dinner", emoji: "🌙", color: "from-indigo-500/20 to-purple-500/20" },
];

export const DailyIntakeBreakdown = ({
  isOpen,
  onClose,
  meals,
  caloriesConsumed,
  caloriesRemaining,
  calorieTarget,
  onDeleteFood,
}: DailyIntakeBreakdownProps) => {
  const [expandedMeals, setExpandedMeals] = useState<string[]>(["breakfast", "lunch", "snacks", "dinner"]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const toggleMeal = (mealType: string) => {
    setExpandedMeals(prev => 
      prev.includes(mealType) 
        ? prev.filter(m => m !== mealType)
        : [...prev, mealType]
    );
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    await onDeleteFood(deleteConfirm.id);
    setDeleting(false);
    setDeleteConfirm(null);
  };

  const getMealCalories = (foods: FoodLog[]) => {
    return foods.reduce((sum, food) => sum + food.calories, 0);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Daily Intake</h2>
            <p className="text-sm text-muted-foreground">Tap items to delete</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Summary */}
        <div className="p-4 bg-card border-b border-border">
          <div className="flex justify-around text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{caloriesConsumed}</p>
              <p className="text-xs text-muted-foreground">Consumed</p>
            </div>
            <div className="w-px bg-border" />
            <div>
              <p className="text-2xl font-bold text-foreground">{caloriesRemaining}</p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
            <div className="w-px bg-border" />
            <div>
              <p className="text-2xl font-bold text-muted-foreground">{calorieTarget}</p>
              <p className="text-xs text-muted-foreground">Target</p>
            </div>
          </div>
        </div>

        {/* Meal Sections */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {MEAL_CONFIG.map((mealConfig) => {
            const foods = meals[mealConfig.type as keyof typeof meals] || [];
            const isExpanded = expandedMeals.includes(mealConfig.type);
            const mealCalories = getMealCalories(foods);

            return (
              <motion.div
                key={mealConfig.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Meal Header */}
                <button
                  onClick={() => toggleMeal(mealConfig.type)}
                  className={`w-full p-4 flex items-center justify-between bg-gradient-to-r ${mealConfig.color}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{mealConfig.emoji}</span>
                    <div className="text-left">
                      <h3 className="font-semibold text-foreground">{mealConfig.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {foods.length} item{foods.length !== 1 ? 's' : ''} • {mealCalories} kcal
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {/* Food Items */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {foods.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          No items logged yet
                        </div>
                      ) : (
                        <div className="divide-y divide-border">
                          {foods.map((food) => (
                            <motion.div
                              key={food.id}
                              layout
                              className="p-4 flex items-center justify-between group"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{food.food_name}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Flame className="w-3 h-3 text-orange-500" />
                                    {food.calories} kcal
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Beef className="w-3 h-3 text-red-500" />
                                    {Math.round(food.protein)}g
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Wheat className="w-3 h-3 text-amber-500" />
                                    {Math.round(food.carbs)}g
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Droplet className="w-3 h-3 text-blue-500" />
                                    {Math.round(food.fat)}g
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteConfirm({ id: food.id, name: food.food_name })}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Food Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This will update your daily totals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
