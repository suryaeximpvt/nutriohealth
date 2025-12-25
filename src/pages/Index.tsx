import { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Coffee, UtensilsCrossed, Cookie, Footprints, Scale, TrendingUp } from "lucide-react";
import { Header } from "@/components/Header";
import { ProgressRing } from "@/components/ProgressRing";
import { MacroBar } from "@/components/MacroBar";
import { MealCard } from "@/components/MealCard";
import { QuickStat } from "@/components/QuickStat";
import { BottomNav } from "@/components/BottomNav";
import { WaterTracker } from "@/components/WaterTracker";
import { AIMealModal } from "@/components/AIMealModal";

// Mock data - would come from user profile/database
const userData = {
  name: "Alex",
  calorieTarget: 2000,
  caloriesConsumed: 1247,
  macros: {
    carbs: { current: 98, target: 250 },
    protein: { current: 67, target: 120 },
    fat: { current: 45, target: 65 },
    fibre: { current: 18, target: 30 },
  },
  water: { current: 1500, target: 2500 },
  steps: 6842,
  stepsTarget: 10000,
  weight: 74.2,
  meals: {
    breakfast: { logged: true, calories: 420, items: "Porridge with berries" },
    lunch: { logged: true, calories: 580, items: "Chicken salad wrap" },
    snacks: { logged: true, calories: 247, items: "Apple, handful of almonds" },
    dinner: { logged: false, calories: 0, items: "" },
  },
};

// AI meal recommendations per meal type
const mealRecommendations = {
  breakfast: {
    explanation: "Starting your day with protein helps maintain steady energy levels and reduces mid-morning cravings. Here are some quick options that fit your goals.",
    options: [
      {
        name: "Nutrio Protein Pancakes",
        description: "Ready in 5 minutes. High protein, low effort - perfect for busy mornings.",
        calories: 380,
        isNutrio: true,
      },
      {
        name: "Scrambled Eggs on Toast",
        description: "Two eggs on wholemeal toast with a side of grilled tomatoes.",
        calories: 350,
      },
      {
        name: "Greek Yogurt Bowl",
        description: "Greek yogurt with granola, mixed berries and a drizzle of honey.",
        calories: 320,
      },
    ],
    followUpQuestion: "Do you usually have time to cook breakfast?",
  },
  lunch: {
    explanation: "A balanced lunch keeps afternoon energy stable. These options work well for eating at a desk or on the go.",
    options: [
      {
        name: "Tuna & Sweetcorn Jacket Potato",
        description: "A British classic. Filling, balanced, and easy to grab from most cafes.",
        calories: 520,
      },
      {
        name: "Chicken Caesar Wrap",
        description: "Grilled chicken, romaine, parmesan and light caesar dressing in a wholemeal wrap.",
        calories: 480,
      },
      {
        name: "Soup & Sandwich Combo",
        description: "Tomato soup with a cheese and ham toastie. Warming and satisfying.",
        calories: 550,
      },
    ],
    followUpQuestion: "Do you bring lunch from home or buy it?",
  },
  snacks: {
    explanation: "Smart snacking prevents overeating at dinner. Here are options that won't derail your progress.",
    options: [
      {
        name: "Apple with Almond Butter",
        description: "A satisfying combo of fibre and healthy fats. About 2 tablespoons.",
        calories: 200,
      },
      {
        name: "Greek Yogurt Pot",
        description: "Plain Greek yogurt. High protein, low sugar, keeps you full.",
        calories: 120,
      },
      {
        name: "Handful of Mixed Nuts",
        description: "About 30g. Almonds, walnuts, cashews - good fats and protein.",
        calories: 180,
      },
    ],
    followUpQuestion: "Do you tend to snack more in the afternoon or evening?",
  },
  dinner: {
    explanation: "Dinner should be satisfying but not heavy. Protein with vegetables and a moderate carb portion works well.",
    options: [
      {
        name: "Grilled Salmon with Vegetables",
        description: "Salmon fillet with roasted broccoli, courgette and new potatoes.",
        calories: 580,
      },
      {
        name: "Chicken Stir-Fry",
        description: "Chicken breast with mixed veg and rice. Quick to make, full of colour.",
        calories: 520,
      },
      {
        name: "Shepherd's Pie (Lighter Version)",
        description: "Lean lamb mince with vegetables, topped with cauliflower mash.",
        calories: 490,
      },
    ],
    followUpQuestion: "How much time do you typically have for cooking dinner?",
  },
};

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [waterIntake, setWaterIntake] = useState(userData.water.current);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<keyof typeof mealRecommendations>("breakfast");

  const caloriesRemaining = userData.calorieTarget - userData.caloriesConsumed;
  const calorieProgress = (userData.caloriesConsumed / userData.calorieTarget) * 100;

  const handleMealClick = (mealType: keyof typeof mealRecommendations) => {
    setSelectedMealType(mealType);
    setModalOpen(true);
  };

  const handleSelectMeal = (meal: { name: string; calories: number }) => {
    // Would add to meal log
    console.log("Selected meal:", meal);
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-lg mx-auto px-4">
        <Header userName={userData.name} />

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
              <p className="font-semibold text-foreground">{userData.caloriesConsumed}</p>
              <p className="text-muted-foreground">Eaten</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="font-semibold text-foreground">{userData.calorieTarget}</p>
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
              current={userData.macros.carbs.current}
              target={userData.macros.carbs.target}
              color="hsl(var(--nutrio-coral))"
              delay={0.3}
            />
            <MacroBar
              label="Protein"
              current={userData.macros.protein.current}
              target={userData.macros.protein.target}
              color="hsl(var(--primary))"
              delay={0.4}
            />
            <MacroBar
              label="Fat"
              current={userData.macros.fat.current}
              target={userData.macros.fat.target}
              color="hsl(var(--nutrio-amber))"
              delay={0.5}
            />
            <MacroBar
              label="Fibre"
              current={userData.macros.fibre.current}
              target={userData.macros.fibre.target}
              color="hsl(var(--nutrio-purple))"
              delay={0.6}
            />
          </div>
        </motion.section>

        {/* Quick Stats */}
        <div className="flex gap-3 mb-4">
          <QuickStat
            icon={<Footprints className="w-5 h-5" />}
            value={userData.steps.toLocaleString()}
            label="Steps"
            color="hsl(var(--nutrio-coral))"
            delay={0.3}
          />
          <QuickStat
            icon={<Scale className="w-5 h-5" />}
            value={`${userData.weight}kg`}
            label="Weight"
            color="hsl(var(--nutrio-purple))"
            delay={0.4}
          />
          <QuickStat
            icon={<TrendingUp className="w-5 h-5" />}
            value="5"
            label="Day Streak"
            color="hsl(var(--nutrio-amber))"
            delay={0.5}
          />
        </div>

        {/* Water Tracker */}
        <WaterTracker
          current={waterIntake}
          target={userData.water.target}
          onAdd={() => setWaterIntake((prev) => Math.min(prev + 250, 5000))}
          onRemove={() => setWaterIntake((prev) => Math.max(prev - 250, 0))}
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
            <MealCard
              title="Breakfast"
              subtitle={userData.meals.breakfast.logged ? userData.meals.breakfast.items : "Tap for AI suggestions"}
              calories={userData.meals.breakfast.calories}
              icon={<Coffee className="w-5 h-5" />}
              logged={userData.meals.breakfast.logged}
              onClick={() => handleMealClick("breakfast")}
              delay={0.5}
            />
            <MealCard
              title="Lunch"
              subtitle={userData.meals.lunch.logged ? userData.meals.lunch.items : "Tap for AI suggestions"}
              calories={userData.meals.lunch.calories}
              icon={<UtensilsCrossed className="w-5 h-5" />}
              logged={userData.meals.lunch.logged}
              onClick={() => handleMealClick("lunch")}
              delay={0.55}
            />
            <MealCard
              title="Snacks"
              subtitle={userData.meals.snacks.logged ? userData.meals.snacks.items : "Tap for AI suggestions"}
              calories={userData.meals.snacks.calories}
              icon={<Cookie className="w-5 h-5" />}
              logged={userData.meals.snacks.logged}
              onClick={() => handleMealClick("snacks")}
              delay={0.6}
            />
            <MealCard
              title="Dinner"
              subtitle={userData.meals.dinner.logged ? userData.meals.dinner.items : "Tap for AI suggestions"}
              calories={userData.meals.dinner.calories}
              icon={<Moon className="w-5 h-5" />}
              logged={userData.meals.dinner.logged}
              onClick={() => handleMealClick("dinner")}
              delay={0.65}
            />
          </div>
        </motion.section>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* AI Meal Recommendation Modal */}
      <AIMealModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mealType={selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
        explanation={mealRecommendations[selectedMealType].explanation}
        options={mealRecommendations[selectedMealType].options}
        followUpQuestion={mealRecommendations[selectedMealType].followUpQuestion}
        onSelectMeal={handleSelectMeal}
      />
    </div>
  );
};

export default Index;
