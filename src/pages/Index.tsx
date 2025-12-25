import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Coffee, UtensilsCrossed, Cookie, Moon, Footprints, Scale, TrendingUp, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { ProgressRing } from "@/components/ProgressRing";
import { MacroBar } from "@/components/MacroBar";
import { MealCard } from "@/components/MealCard";
import { QuickStat } from "@/components/QuickStat";
import { BottomNav } from "@/components/BottomNav";
import { WaterTracker } from "@/components/WaterTracker";
import { AIMealModal } from "@/components/AIMealModal";
import { FoodLogModal } from "@/components/FoodLogModal";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { useAIMeals } from "@/hooks/useAIMeals";
import { toast } from "sonner";

type MealType = "breakfast" | "lunch" | "snacks" | "dinner";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, dailySummary, waterGlasses, loading: dataLoading, logFood, updateWater } = useUserData();
  const { loading: aiLoading, response: aiResponse, getMealSuggestions } = useAIMeals();

  const [activeTab, setActiveTab] = useState("home");
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [foodLogModalOpen, setFoodLogModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("breakfast");

  // Handle tab changes from bottom nav
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "log") {
      // Open food log modal when Log tab is clicked
      setFoodLogModalOpen(true);
    } else if (tab === "profile") {
      // Navigate to profile/settings (for now just show toast)
      toast.info("Profile settings coming soon!");
    } else if (tab === "workout") {
      toast.info("Workout tracking coming soon!");
    } else if (tab === "progress") {
      toast.info("Progress charts coming soon!");
    }
  };

  // Redirect to auth if not logged in, or onboarding if profile incomplete
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Redirect to onboarding if profile is incomplete (first login)
  useEffect(() => {
    if (!authLoading && !dataLoading && user && profile) {
      // Check if essential profile data is missing (means onboarding not completed)
      if (!profile.goal || !profile.height_cm || !profile.weight_kg) {
        navigate("/onboarding");
      }
    }
  }, [user, authLoading, dataLoading, profile, navigate]);

  // Calculate values from profile and daily summary
  const calorieTarget = profile?.calorie_target || 2000;
  const caloriesConsumed = dailySummary.totalCalories;
  const caloriesRemaining = Math.max(0, calorieTarget - caloriesConsumed);
  const calorieProgress = Math.min((caloriesConsumed / calorieTarget) * 100, 100);

  const userName = profile?.full_name?.split(" ")[0] || "there";

  const getMealSummary = (mealType: MealType) => {
    const meals = dailySummary.meals[mealType];
    if (meals.length === 0) {
      return { logged: false, calories: 0, items: "Tap for AI suggestions" };
    }
    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    const itemNames = meals.map((m) => m.food_name).join(", ");
    return { logged: true, calories: totalCalories, items: itemNames };
  };

  const handleMealClick = async (mealType: MealType) => {
    setSelectedMealType(mealType);
    setAiModalOpen(true);

    // Fetch AI suggestions
    const todaysMeals = Object.entries(dailySummary.meals).flatMap(([type, meals]) =>
      meals.map((m) => ({ meal_type: type, food_name: m.food_name, calories: m.calories }))
    );

    await getMealSuggestions(mealType, profile, caloriesRemaining, todaysMeals);
  };

  const handleSelectMeal = (meal: { name: string; calories: number }) => {
    // Close AI modal and open food log modal to confirm
    setAiModalOpen(false);
    setFoodLogModalOpen(true);
  };

  const handleLogFood = async (food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fibre: number;
    quantity: number;
  }) => {
    const { error } = await logFood(selectedMealType, food);
    if (error) {
      toast.error("Failed to log food");
    }
  };

  const handleWaterAdd = async () => {
    const newGlasses = waterGlasses + 1;
    const { error } = await updateWater(newGlasses);
    if (error) {
      toast.error("Failed to update water intake");
    }
  };

  const handleWaterRemove = async () => {
    const newGlasses = Math.max(0, waterGlasses - 1);
    const { error } = await updateWater(newGlasses);
    if (error) {
      toast.error("Failed to update water intake");
    }
  };

  // Show loading state
  if (authLoading || (user && dataLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your data...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-lg mx-auto px-4">
        <Header userName={userName} />

        {/* Main Calorie Ring */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center py-6"
        >
          <ProgressRing
            progress={calorieProgress}
            size={180}
            strokeWidth={12}
            color="hsl(var(--primary))"
          >
            <div className="text-center">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-4xl font-bold text-foreground"
              >
                {caloriesRemaining}
              </motion.p>
              <p className="text-sm text-muted-foreground">kcal remaining</p>
            </div>
          </ProgressRing>

          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="text-center">
              <p className="font-semibold text-foreground">{caloriesConsumed}</p>
              <p className="text-muted-foreground">Eaten</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="font-semibold text-foreground">{calorieTarget}</p>
              <p className="text-muted-foreground">Target</p>
            </div>
          </div>
        </motion.section>

        {/* Macros Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-5 mb-4"
        >
          <h2 className="font-semibold text-foreground mb-4">Today's Macros</h2>
          <div className="space-y-3">
            <MacroBar
              label="Carbs"
              current={Math.round(dailySummary.totalCarbs)}
              target={profile?.carbs_target || 250}
              color="hsl(var(--nutrio-coral))"
              delay={0.3}
            />
            <MacroBar
              label="Protein"
              current={Math.round(dailySummary.totalProtein)}
              target={profile?.protein_target || 120}
              color="hsl(var(--primary))"
              delay={0.4}
            />
            <MacroBar
              label="Fat"
              current={Math.round(dailySummary.totalFat)}
              target={profile?.fat_target || 65}
              color="hsl(var(--nutrio-amber))"
              delay={0.5}
            />
            <MacroBar
              label="Fibre"
              current={Math.round(dailySummary.totalFibre)}
              target={profile?.fibre_target || 30}
              color="hsl(var(--nutrio-purple))"
              delay={0.6}
            />
          </div>
        </motion.section>

        {/* Quick Stats */}
        <div className="flex gap-3 mb-4">
          <QuickStat
            icon={<Footprints className="w-5 h-5" />}
            value="--"
            label="Steps"
            color="hsl(var(--nutrio-coral))"
            delay={0.3}
          />
          <QuickStat
            icon={<Scale className="w-5 h-5" />}
            value={profile?.weight_kg ? `${profile.weight_kg}kg` : "--"}
            label="Weight"
            color="hsl(var(--nutrio-purple))"
            delay={0.4}
          />
          <QuickStat
            icon={<TrendingUp className="w-5 h-5" />}
            value="1"
            label="Day Streak"
            color="hsl(var(--nutrio-amber))"
            delay={0.5}
          />
        </div>

        {/* Water Tracker */}
        <WaterTracker
          current={waterGlasses * 250}
          target={2500}
          onAdd={handleWaterAdd}
          onRemove={handleWaterRemove}
        />

        {/* Meals Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <h2 className="font-semibold text-foreground mb-3">Today's Meals</h2>
          <div className="space-y-3">
            {(["breakfast", "lunch", "snacks", "dinner"] as MealType[]).map((mealType, index) => {
              const meal = getMealSummary(mealType);
              const icons = {
                breakfast: <Coffee className="w-5 h-5" />,
                lunch: <UtensilsCrossed className="w-5 h-5" />,
                snacks: <Cookie className="w-5 h-5" />,
                dinner: <Moon className="w-5 h-5" />,
              };
              return (
                <MealCard
                  key={mealType}
                  title={mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                  subtitle={meal.items}
                  calories={meal.calories}
                  icon={icons[mealType]}
                  logged={meal.logged}
                  onClick={() => handleMealClick(mealType)}
                  delay={0.5 + index * 0.05}
                />
              );
            })}
          </div>
        </motion.section>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* AI Meal Recommendation Modal */}
      <AIMealModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        mealType={selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
        explanation={aiResponse?.explanation || "Loading suggestions..."}
        options={aiResponse?.options || []}
        followUpQuestion={aiResponse?.followUpQuestion || ""}
        onSelectMeal={handleSelectMeal}
        isLoading={aiLoading}
        onLogFood={() => {
          setAiModalOpen(false);
          setFoodLogModalOpen(true);
        }}
      />

      {/* Food Log Modal */}
      <FoodLogModal
        isOpen={foodLogModalOpen}
        onClose={() => setFoodLogModalOpen(false)}
        mealType={selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
        onLogFood={handleLogFood}
      />
    </div>
  );
};

export default Index;