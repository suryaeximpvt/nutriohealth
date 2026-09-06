import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Sparkles, Loader2, Flame, Clock, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePantrySuggestions, PantryMeal } from "@/hooks/usePantrySuggestions";

const QUICK_ITEMS = [
  "Eggs", "Chicken", "Rice", "Pasta", "Oats", "Milk", "Yoghurt", "Paneer",
  "Tofu", "Beans", "Lentils", "Spinach", "Tomatoes", "Potatoes", "Bread", "Cheese",
];

interface PantryFinderProps {
  calorieTarget: number;
  caloriesRemaining: number;
  proteinGap: number;
  dietPreference: string;
  cuisinePreference: string;
  allergies: string[];
  excludedFoods: string[];
  goal: string;
  onLogMeal: (meal: PantryMeal) => void;
}

export const PantryFinder = ({
  calorieTarget,
  caloriesRemaining,
  proteinGap,
  dietPreference,
  cuisinePreference,
  allergies,
  excludedFoods,
  goal,
  onLogMeal,
}: PantryFinderProps) => {
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const { loading, meals, getPantryMeals } = usePantrySuggestions();

  const addItem = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    if (items.some((i) => i.toLowerCase() === value.toLowerCase())) return;
    setItems([...items, value]);
    setInput("");
  };

  const removeItem = (item: string) => setItems(items.filter((i) => i !== item));

  const handleFind = () => {
    getPantryMeals({
      ingredients: items,
      calorieTarget,
      caloriesRemaining,
      proteinGap,
      dietPreference,
      cuisinePreference,
      allergies,
      excludedFoods,
      goal,
    });
  };

  return (
    <div className="space-y-5">
      {/* Input card */}
      <section className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        <header className="flex items-center gap-3 p-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShoppingBasket className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">What's in your kitchen?</h3>
            <p className="text-sm text-muted-foreground">
              Add what you have — we'll match it to today's targets
            </p>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addItem(input);
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. eggs, spinach, rice"
              aria-label="Add a food item you have"
            />
            <Button type="submit" size="icon" variant="secondary" aria-label="Add item">
              <Plus className="w-4 h-4" />
            </Button>
          </form>

          {/* Quick add */}
          <div className="flex flex-wrap gap-2">
            {QUICK_ITEMS.filter((q) => !items.some((i) => i.toLowerCase() === q.toLowerCase())).map((q) => (
              <button
                key={q}
                onClick={() => addItem(q)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                + {q}
              </button>
            ))}
          </div>

          {/* Selected items */}
          {items.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
              {items.map((item) => (
                <motion.span
                  key={item}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary"
                >
                  {item}
                  <button onClick={() => removeItem(item)} aria-label={`Remove ${item}`}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.span>
              ))}
            </div>
          )}

          <Button onClick={handleFind} disabled={items.length === 0 || loading} className="w-full" size="lg">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Find meals I can make
          </Button>
        </div>
      </section>

      {/* Results */}
      <AnimatePresence>
        {meals && meals.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
              You can make {meals.length} meals
            </h3>
            {meals.map((meal, index) => (
              <motion.article
                key={meal.name + index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-2xl p-4 shadow-card border border-border"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{meal.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground">{meal.name}</h4>
                    <p className="text-sm text-muted-foreground">{meal.description}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs mt-2">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-nutrio-orange" />
                        {meal.calories} kcal
                      </span>
                      <span className="text-primary font-medium">{meal.protein}g protein</span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {meal.prepTime}
                      </span>
                    </div>

                    {meal.usesIngredients?.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Uses: {meal.usesIngredients.join(", ")}
                      </p>
                    )}
                    {meal.missingItems?.length > 0 && (
                      <p className="text-xs text-nutrio-orange mt-1">
                        You'll also need: {meal.missingItems.join(", ")}
                      </p>
                    )}
                    {meal.fitNote && (
                      <p className="text-xs text-primary mt-2">{meal.fitNote}</p>
                    )}
                  </div>
                </div>

                <Button size="sm" onClick={() => onLogMeal(meal)} className="w-full mt-3">
                  Log this meal
                </Button>
              </motion.article>
            ))}
          </motion.section>
        )}
      </AnimatePresence>

      {meals && meals.length === 0 && !loading && (
        <p className="text-center text-sm text-muted-foreground py-6">
          No matches yet — try adding a couple more items.
        </p>
      )}
    </div>
  );
};
