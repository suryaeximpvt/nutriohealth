import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, ChevronRight, Sparkles, Crown, Loader2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { ProgressRing } from "@/components/ProgressRing";
import { MacroBar } from "@/components/MacroBar";
import { BottomNav } from "@/components/BottomNav";
import { HealthTrackingCard } from "@/components/HealthTrackingCard";
import { AISuggestedMealCard } from "@/components/AISuggestedMealCard";
import { FoodLogModal } from "@/components/FoodLogModal";
import { PhotoUploadModal } from "@/components/PhotoUploadModal";
import { MealTypeSelector } from "@/components/MealTypeSelector";
import { PremiumModal } from "@/components/PremiumModal";
import { WaterTracker } from "@/components/WaterTracker";
import { DailyIntakeBreakdown } from "@/components/DailyIntakeBreakdown";
import { LifestyleModeCard } from "@/components/LifestyleModeCard";
import { MealCheckIn } from "@/components/MealCheckIn";
import { NonNegotiablesCard } from "@/components/NonNegotiablesCard";
import { WeeklyInsightCard } from "@/components/WeeklyInsightCard";
import { RecommendationsCard } from "@/components/RecommendationsCard";

import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { useDailyAISuggestions } from "@/hooks/useDailyAISuggestions";
import { usePremium } from "@/hooks/usePremium";
import { useNotifications } from "@/hooks/useNotifications";
import { AISuggestion } from "@/hooks/useDailyAISuggestions";
import { toast } from "sonner";

const MEAL_CONFIG = [
  { type: "breakfast" as const, title: "Breakfast", emoji: "🌅", targetRatio: 0.25 },
  { type: "lunch" as const, title: "Lunch", emoji: "☀️", targetRatio: 0.30 },
  { type: "snacks" as const, title: "Snacks", emoji: "🍎", targetRatio: 0.15 },
  { type: "dinner" as const, title: "Dinner", emoji: "🌙", targetRatio: 0.30 },
];

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, dailySummary, loading: dataLoading, logFood, deleteFood, waterGlasses, lastWaterLogTime, updateWater } = useUserData();
  const { loading: aiLoading, suggestions, fetchDailySuggestions, regenerateMeal } = useDailyAISuggestions();

  const { isPremium, canUseAI, getAISuggestionsRemaining, incrementAIUsage } = usePremium();
  
  // Initialize notifications (schedules reminders on native platforms)
  useNotifications();

  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [mealSelectorOpen, setMealSelectorOpen] = useState(false);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [intakeBreakdownOpen, setIntakeBreakdownOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<"breakfast" | "lunch" | "snacks" | "dinner">("breakfast");
  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && !dataLoading && user && profile) {
      if (!profile.goal || !profile.height_cm || !profile.weight_kg) {
        navigate("/onboarding");
      }
    }
  }, [user, authLoading, dataLoading, profile, navigate]);

  // Auto-fetch AI suggestions when profile and data are loaded
  useEffect(() => {
    if (profile && !dataLoading && !suggestionsLoaded && user) {
      const calorieTarget = profile.calorie_target || 2000;
      const caloriesConsumed = dailySummary.totalCalories;
      const caloriesRemaining = Math.max(0, calorieTarget - caloriesConsumed);

      const previousMeals = Object.values(dailySummary.meals)
        .flat()
        .map((m) => ({
          meal_type: m.meal_type,
          food_name: m.food_name,
          calories: m.calories,
        }));

      // Determine cultural preference (default to mixed)
      const culturalPref = (profile.diet_preference?.toLowerCase().includes('indian') 
        ? 'indian' 
        : profile.diet_preference?.toLowerCase().includes('uk') || profile.diet_preference?.toLowerCase().includes('british')
        ? 'uk'
        : 'mixed') as 'indian' | 'uk' | 'mixed';

      fetchDailySuggestions({
        calorieTarget,
        caloriesRemaining,
        proteinTarget: profile.protein_target || 120,
        proteinConsumed: dailySummary.totalProtein,
        carbsTarget: profile.carbs_target || 250,
        carbsConsumed: dailySummary.totalCarbs,
        fatTarget: profile.fat_target || 65,
        fatConsumed: dailySummary.totalFat,
        activityLevel: profile.activity_level || 'moderate',
        dietPreference: profile.diet_preference || '',
        culturalPreference: culturalPref,
        allergies: profile.allergies || [],
        excludedFoods: profile.excluded_foods || [],
        goal: profile.goal || 'maintain',
        previousMeals,
      });
      setSuggestionsLoaded(true);
    }
  }, [profile, dataLoading, suggestionsLoaded, user, dailySummary, fetchDailySuggestions]);

  const calorieTarget = profile?.calorie_target || 2000;
  const caloriesConsumed = dailySummary.totalCalories;
  const caloriesRemaining = Math.max(0, calorieTarget - caloriesConsumed);
  const calorieProgress = Math.min((caloriesConsumed / calorieTarget) * 100, 100);
  const userName = profile?.full_name?.split(" ")[0] || "there";

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

const handleLogAIMeal = async (mealType: typeof selectedMealType, suggestion: AISuggestion) => {
    if (!suggestion) return;

    const result = await logFood(mealType, {
      name: suggestion.name,
      calories: suggestion.calories,
      protein: suggestion.protein,
      carbs: suggestion.carbs,
      fat: suggestion.fat,
      fibre: Math.round(suggestion.calories / 100),
      quantity: 1,
    });

    if (result.error) {
      toast.error("Failed to log meal");
    } else {
      toast.success(`Added ${suggestion.name} to ${mealType}`);
    }
  };

  const handleRegenerate = async (mealType: typeof selectedMealType) => {
    // Check if user can use AI
    if (!canUseAI()) {
      toast.error("You've used all your AI suggestions today. Upgrade to Premium for unlimited access!");
      setPremiumModalOpen(true);
      return;
    }

    const culturalPref = (profile?.diet_preference?.toLowerCase().includes('indian') 
      ? 'indian' 
      : profile?.diet_preference?.toLowerCase().includes('uk') || profile?.diet_preference?.toLowerCase().includes('british')
      ? 'uk'
      : 'mixed') as 'indian' | 'uk' | 'mixed';

    const previousMeals = Object.values(dailySummary.meals)
      .flat()
      .map((m) => ({
        meal_type: m.meal_type,
        food_name: m.food_name,
        calories: m.calories,
      }));

    await regenerateMeal(mealType, {
      calorieTarget,
      caloriesRemaining,
      proteinTarget: profile?.protein_target || 120,
      proteinConsumed: dailySummary.totalProtein,
      carbsTarget: profile?.carbs_target || 250,
      carbsConsumed: dailySummary.totalCarbs,
      fatTarget: profile?.fat_target || 65,
      fatConsumed: dailySummary.totalFat,
      activityLevel: profile?.activity_level || 'moderate',
      dietPreference: profile?.diet_preference || '',
      culturalPreference: culturalPref,
      allergies: profile?.allergies || [],
      excludedFoods: profile?.excluded_foods || [],
      goal: profile?.goal || 'maintain',
      previousMeals,
    });

    // Increment AI usage for free users
    await incrementAIUsage();
    toast.success(`Generated new ${mealType} suggestion`);
  };

  const handleQuickScan = () => {
    setMealSelectorOpen(true);
  };

  const handleMealTypeSelected = (mealType: typeof selectedMealType) => {
    setSelectedMealType(mealType);
    setMealSelectorOpen(false);
    setPhotoModalOpen(true);
  };

  const handleAddManual = (mealType: typeof selectedMealType) => {
    setSelectedMealType(mealType);
    setFoodModalOpen(true);
  };

  const handleAddPhoto = (mealType: typeof selectedMealType) => {
    setSelectedMealType(mealType);
    setPhotoModalOpen(true);
  };

  const handleFoodRecognized = async (food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fibre: number;
  }) => {
    const result = await logFood(selectedMealType, {
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fibre: food.fibre,
      quantity: 1,
    });

    if (result.error) {
      toast.error("Failed to log food");
    } else {
      toast.success(`Added ${food.name} to ${selectedMealType}`);
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

        {/* Scan Food Card */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={handleQuickScan}
          className="w-full bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 flex items-center gap-4 mb-3"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
            <Camera className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-primary-foreground text-lg">Scan Food</h3>
            <p className="text-primary-foreground/80 text-sm">Take a photo to track calories</p>
          </div>
        </motion.button>

        {/* Go Premium Card - Only show if not premium */}
        {!isPremium && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => setPremiumModalOpen(true)}
            className="w-full bg-gradient-to-r from-primary/90 to-primary/70 rounded-2xl p-4 flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary-foreground">Go Premium</span>
                  <Sparkles className="w-4 h-4 text-nutrio-amber" />
                </div>
                <p className="text-primary-foreground/80 text-sm">
                  {getAISuggestionsRemaining()} AI suggestions left today
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-primary-foreground" />
          </motion.button>
        )}

        {/* Premium Badge - Show if premium */}
        {isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="w-full bg-gradient-to-r from-nutrio-amber/20 to-primary/20 rounded-2xl p-4 flex items-center gap-3 mb-6 border border-nutrio-amber/30"
          >
            <div className="w-10 h-10 rounded-xl bg-nutrio-amber/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-nutrio-amber" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Premium Member</span>
                <Sparkles className="w-4 h-4 text-nutrio-amber" />
              </div>
              <p className="text-muted-foreground text-sm">Unlimited AI suggestions active</p>
            </div>
          </motion.div>
        )}

        {/* Today's Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 shadow-card mb-4"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-foreground text-lg">Today's Summary</h2>
            <span className="text-muted-foreground text-sm">{dateStr}</span>
          </div>

          <motion.button
            className="flex justify-center mb-6 cursor-pointer w-full mx-auto"
            onClick={() => setIntakeBreakdownOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ProgressRing
              progress={calorieProgress}
              size={180}
              strokeWidth={12}
              color="hsl(var(--primary))"
            >
              <div className="text-center">
                <p className="text-4xl font-bold text-foreground">{caloriesRemaining}</p>
                <p className="text-muted-foreground text-sm">Remaining</p>
                <p className="text-xs text-primary mt-1">Tap to view</p>
              </div>
            </ProgressRing>
          </motion.button>

          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="font-semibold text-foreground">{caloriesConsumed}</span>
              </div>
              <span className="text-muted-foreground text-sm">Eaten</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <span className="w-2 h-2 rounded-full bg-nutrio-amber" />
                <span className="font-semibold text-foreground">0</span>
              </div>
              <span className="text-muted-foreground text-sm">Burned</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <span className="w-2 h-2 rounded-full bg-nutrio-blue" />
                <span className="font-semibold text-foreground">{calorieTarget}</span>
              </div>
              <span className="text-muted-foreground text-sm">Goal</span>
            </div>
          </div>
        </motion.div>

        {/* Personalised AI recommendations */}
        <div className="mb-4">
          <RecommendationsCard delay={0.212} />
        </div>



        {/* Weekly Nutrio Insight */}
        <div className="mb-4">
          <WeeklyInsightCard delay={0.215} />
        </div>

        {/* Lifestyle Mode */}
        <div className="mb-4">
          <LifestyleModeCard delay={0.22} />
        </div>

        {/* Today's meal check-in */}
        <div className="mb-4">
          <MealCheckIn
            delay={0.24}
            onAddPhoto={handleAddPhoto}
            loggedCounts={{
              breakfast: dailySummary.meals.breakfast?.length ?? 0,
              lunch: dailySummary.meals.lunch?.length ?? 0,
              snacks: dailySummary.meals.snacks?.length ?? 0,
              dinner: dailySummary.meals.dinner?.length ?? 0,
            }}
          />
        </div>

        {/* Non-negotiables */}
        <div className="mb-4">
          <NonNegotiablesCard delay={0.26} />
        </div>



        {/* Macronutrients Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card rounded-2xl p-5 shadow-card mb-4"
        >
          <h2 className="font-bold text-foreground mb-4">Macronutrients</h2>
          <div className="space-y-4">
            <MacroBar
              label="Carbs"
              current={Math.round(dailySummary.totalCarbs)}
              target={profile?.carbs_target || 250}
              color="hsl(var(--nutrio-orange))"
              delay={0.3}
            />
            <MacroBar
              label="Protein"
              current={Math.round(dailySummary.totalProtein)}
              target={profile?.protein_target || 120}
              color="hsl(var(--primary))"
              delay={0.35}
            />
            <MacroBar
              label="Fat"
              current={Math.round(dailySummary.totalFat)}
              target={profile?.fat_target || 65}
              color="hsl(var(--nutrio-amber))"
              delay={0.4}
            />
            <MacroBar
              label="Fibre"
              current={Math.round(dailySummary.totalFibre)}
              target={profile?.fibre_target || 30}
              color="hsl(var(--nutrio-purple))"
              delay={0.45}
            />
          </div>
        </motion.div>

        {/* Water Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <WaterTracker
            current={waterGlasses * 250}
            target={2000}
            onAdd={() => updateWater(waterGlasses + 1)}
            onRemove={() => updateWater(Math.max(0, waterGlasses - 1))}
          />
        </motion.div>

        {/* Health Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-4"
        >
          <HealthTrackingCard delay={0.2} />
        </motion.div>

        {/* AI-Powered Meal Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Nutrio AI Picks for Today</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Personalized meals based on your {caloriesRemaining} kcal remaining and nutritional goals
          </p>
          <div className="space-y-3">
            {MEAL_CONFIG.map((meal, index) => (
              <AISuggestedMealCard
                key={meal.type}
                title={meal.title}
                mealType={meal.type}
                emoji={meal.emoji}
                mealOptions={suggestions[meal.type]}
                isLoading={aiLoading && !suggestions[meal.type]}
                loggedFoods={dailySummary.meals[meal.type]}
                onLogMeal={(suggestion) => handleLogAIMeal(meal.type, suggestion)}
                onRegenerate={() => handleRegenerate(meal.type)}
                onAddPhoto={() => handleAddPhoto(meal.type)}
                onAddManual={() => handleAddManual(meal.type)}
                onDeleteFood={deleteFood}
                delay={0.4 + index * 0.05}
              />
            ))}
          </div>
        </motion.div>

        {/* Shop Nutrio Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mb-4"
        >
          <button
            onClick={() => navigate("/shop")}
            className="w-full bg-gradient-to-r from-nutrio-amber/20 to-nutrio-orange/20 border border-nutrio-amber/30 rounded-2xl p-4 flex items-center justify-between hover:from-nutrio-amber/30 hover:to-nutrio-orange/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-nutrio-amber/20 flex items-center justify-center">
                <span className="text-xl">🛒</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">Shop Nutrio Products</h3>
                <p className="text-sm text-muted-foreground">Browse our protein range</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-nutrio-amber" />
          </button>
        </motion.div>
      </div>

      <BottomNav />

      {/* Modals */}
      <FoodLogModal
        isOpen={foodModalOpen}
        onClose={() => setFoodModalOpen(false)}
        mealType={selectedMealType}
        onLogFood={async (food) => {
          const result = await logFood(selectedMealType, food);
          if (result.error) {
            toast.error("Failed to log food");
          } else {
            toast.success(`Added ${food.name} to ${selectedMealType}`);
            setFoodModalOpen(false);
          }
        }}
      />

      <PhotoUploadModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        mealType={selectedMealType}
        onFoodRecognized={handleFoodRecognized}
      />

      <MealTypeSelector
        isOpen={mealSelectorOpen}
        onClose={() => setMealSelectorOpen(false)}
        onSelect={handleMealTypeSelected}
      />

      <PremiumModal
        isOpen={premiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
      />

      <DailyIntakeBreakdown
        isOpen={intakeBreakdownOpen}
        onClose={() => setIntakeBreakdownOpen(false)}
        meals={dailySummary.meals}
        caloriesConsumed={caloriesConsumed}
        caloriesRemaining={caloriesRemaining}
        calorieTarget={calorieTarget}
        onDeleteFood={deleteFood}
      />
    </div>
  );
};

export default Index;
