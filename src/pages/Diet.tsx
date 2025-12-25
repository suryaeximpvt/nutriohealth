import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, Flame, Clock, ChevronRight, Loader2, Zap, Wallet, Star } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { useAIDietSuggestions } from "@/hooks/useAIDietSuggestions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MealSuggestion {
  name: string;
  description: string;
  calories: number;
  protein: number;
  prepTime: string;
  emoji: string;
}

const CATEGORY_CONFIG = [
  { key: "bestForYou", title: "Best for You Now", icon: Star, color: "text-primary", bgColor: "bg-primary/10" },
  { key: "highProtein", title: "High Protein Picks", icon: Zap, color: "text-nutrio-orange", bgColor: "bg-nutrio-orange/10" },
  { key: "quickMeals", title: "Quick Meals", icon: Clock, color: "text-nutrio-blue", bgColor: "bg-nutrio-blue/10" },
  { key: "budgetFriendly", title: "Budget Friendly", icon: Wallet, color: "text-nutrio-purple", bgColor: "bg-nutrio-purple/10" },
];

const Diet = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, dailySummary, loading: dataLoading, logFood } = useUserData();
  const { loading: suggestionsLoading, suggestions, getSuggestions } = useAIDietSuggestions();
  
  const [culturalPreference, setCulturalPreference] = useState<"indian" | "uk" | "mixed">("uk");
  const [expandedCategory, setExpandedCategory] = useState<string | null>("bestForYou");

  const userName = profile?.full_name?.split(" ")[0] || "there";
  const caloriesRemaining = Math.max(0, (profile?.calorie_target || 2000) - dailySummary.totalCalories);
  const proteinGap = Math.max(0, (profile?.protein_target || 120) - dailySummary.totalProtein);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && profile && !suggestionsLoading) {
      loadSuggestions();
    }
  }, [user, profile, culturalPreference]);

  const loadSuggestions = async () => {
    if (!profile) return;
    
    await getSuggestions({
      caloriesRemaining,
      proteinGap,
      activityLevel: profile.activity_level || "moderate",
      dietPreference: profile.diet_preference || "none",
      culturalPreference,
      allergies: profile.allergies || [],
      excludedFoods: profile.excluded_foods || [],
      goal: profile.goal || "maintain",
    });
  };

  const handleAddMeal = async (meal: MealSuggestion) => {
    const result = await logFood("lunch", {
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: Math.round(meal.calories * 0.4 / 4),
      fat: Math.round(meal.calories * 0.3 / 9),
      fibre: Math.round(meal.calories / 100),
      quantity: 1,
    });

    if (result.error) {
      toast.error("Failed to add meal");
    } else {
      toast.success(`Added ${meal.name} to your log`);
    }
  };

  if (authLoading || (user && dataLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-lg mx-auto px-4">
        <AppHeader userName={userName} />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">AI Meal Ideas</h1>
          </div>
          <p className="text-muted-foreground">Personalized suggestions based on your goals</p>
        </motion.div>

        {/* Cultural Preference Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-4"
        >
          {[
            { value: "uk", label: "🇬🇧 British" },
            { value: "indian", label: "🇮🇳 Indian" },
            { value: "mixed", label: "🌍 Mixed" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setCulturalPreference(option.value as typeof culturalPreference);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-colors ${
                culturalPreference === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border border-border"
              }`}
            >
              {option.label}
            </button>
          ))}
        </motion.div>

        {/* Refresh Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <Button
            onClick={loadSuggestions}
            disabled={suggestionsLoading}
            variant="outline"
            className="w-full"
          >
            {suggestionsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh Suggestions
          </Button>
        </motion.div>

        {/* Context Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-4 shadow-card mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Calories remaining</p>
              <p className="text-xl font-bold text-foreground">{caloriesRemaining} kcal</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <p className="text-sm text-muted-foreground">Protein gap</p>
              <p className="text-xl font-bold text-primary">{Math.round(proteinGap)}g</p>
            </div>
          </div>
        </motion.div>

        {/* Meal Categories */}
        {suggestionsLoading && !suggestions ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Getting personalized suggestions...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {CATEGORY_CONFIG.map((category, index) => {
              const meals = suggestions?.[category.key as keyof typeof suggestions] as MealSuggestion[] | undefined;
              const isExpanded = expandedCategory === category.key;
              const Icon = category.icon;

              return (
                <motion.div
                  key={category.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * 0.05 }}
                  className="bg-card rounded-2xl shadow-card overflow-hidden"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.key)}
                    className="w-full p-4 flex items-center gap-3"
                  >
                    <div className={`w-10 h-10 ${category.bgColor} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${category.color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-foreground">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {meals?.length || 0} suggestions
                      </p>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </button>

                  {/* Expanded Meals */}
                  {isExpanded && meals && meals.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="border-t border-border"
                    >
                      <div className="p-4 space-y-3">
                        {meals.map((meal, mealIndex) => (
                          <motion.div
                            key={meal.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: mealIndex * 0.05 }}
                            className="bg-muted/50 rounded-xl p-4"
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">{meal.emoji}</div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground">{meal.name}</h4>
                                <p className="text-sm text-muted-foreground mb-2">{meal.description}</p>
                                <div className="flex items-center gap-3 text-xs">
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
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleAddMeal(meal)}
                                className="shrink-0"
                              >
                                Add
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Diet;
