import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Camera, Mic, Plus, Loader2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { FoodLogModal } from "@/components/FoodLogModal";
import { MealDetailsModal } from "@/components/MealDetailsModal";
import { toast } from "sonner";

type MealType = "breakfast" | "lunch" | "snacks" | "dinner";

const QUICK_ACTIONS = [
  { id: "food", label: "Food", icon: "🍽️", color: "bg-primary/10 text-primary" },
  { id: "steps", label: "Steps", icon: "👟", color: "bg-nutrio-amber/10 text-nutrio-amber" },
  { id: "water", label: "Water", icon: "💧", color: "bg-nutrio-blue/10 text-nutrio-blue" },
  { id: "weight", label: "Weight", icon: "⚖️", color: "bg-nutrio-purple/10 text-nutrio-purple" },
  { id: "exercise", label: "Exercise", icon: "🏃", color: "bg-nutrio-coral/10 text-nutrio-coral" },
];

const Log = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, dailySummary, waterGlasses, loading: dataLoading, logFood, deleteFood, editFood, updateWater } = useUserData();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"food" | "exercise">("food");
  const [foodLogModalOpen, setFoodLogModalOpen] = useState(false);
  const [mealDetailsModalOpen, setMealDetailsModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("breakfast");
  const [isScanning, setIsScanning] = useState(false);

  const userName = profile?.full_name?.split(" ")[0] || "there";

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(stream => {
        stream.getTracks().forEach(track => track.stop());
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.info("Photo scanning is in beta. Try manual search for now.");
      setSearchQuery("Chicken");
    } catch {
      toast.error("Camera access denied. Please enable camera permissions.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleBarcodeScan = async () => {
    setIsScanning(true);
    try {
      await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(stream => {
        stream.getTracks().forEach(track => track.stop());
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.info("Barcode scanning is in beta. Try manual search for now.");
    } catch {
      toast.error("Camera access denied.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice input not supported in this browser");
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      toast.success(`Heard: "${transcript}"`);
    };
    recognition.onerror = () => toast.error("Couldn't understand. Try again.");
    recognition.start();
    toast.info("Listening... say a food name");
  };

  const handleLogFood = async (food: { name: string; calories: number; protein: number; carbs: number; fat: number; fibre: number; quantity: number }) => {
    const { error } = await logFood(selectedMealType, food);
    if (error) toast.error("Failed to log food");
  };

  const todaysMeals = Object.values(dailySummary.meals).flat();

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

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h1 className="text-2xl font-bold text-foreground">Quick Log</h1>
          <p className="text-muted-foreground">Track your food, exercise & more</p>
        </motion.div>

        {/* Today's Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 mb-4"
        >
          <p className="text-primary-foreground/80 text-sm mb-3">Today's Progress</p>
          <div className="flex justify-between text-center">
            <div>
              <p className="text-2xl font-bold text-primary-foreground">{dailySummary.totalCalories}</p>
              <p className="text-primary-foreground/70 text-xs">kcal</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-foreground">0</p>
              <p className="text-primary-foreground/70 text-xs">Steps</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-foreground">{waterGlasses}</p>
              <p className="text-primary-foreground/70 text-xs">Water</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-foreground">{Math.round(dailySummary.totalProtein)}</p>
              <p className="text-primary-foreground/70 text-xs">Protein</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-foreground">{profile?.weight_kg || "--"}</p>
              <p className="text-primary-foreground/70 text-xs">kg</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Action Icons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex justify-between gap-2 mb-4"
        >
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                if (action.id === "food") setFoodLogModalOpen(true);
                else if (action.id === "exercise") navigate("/workout");
                else if (action.id === "water") updateWater(waterGlasses + 1);
                else toast.info(`${action.label} tracking coming soon!`);
              }}
              className="flex-1 flex flex-col items-center gap-2 py-3 bg-card rounded-xl shadow-card"
            >
              <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center text-xl`}>
                {action.icon}
              </div>
              <span className="text-xs text-muted-foreground font-medium">{action.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Log Food / Log Exercise Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-4"
        >
          <button
            onClick={() => setActiveTab("food")}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "food" ? "bg-card text-foreground shadow-card" : "text-muted-foreground"
            }`}
          >
            Log Food
          </button>
          <button
            onClick={() => setActiveTab("exercise")}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "exercise" ? "bg-card text-foreground shadow-card" : "text-muted-foreground"
            }`}
          >
            Log Exercise
          </button>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="relative mb-4"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search foods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-xl bg-card border-border"
          />
        </motion.div>

        {/* Scan / Barcode / Voice Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 mb-6"
        >
          <Button
            onClick={handleScan}
            disabled={isScanning}
            className="flex-1 h-14 bg-primary hover:bg-primary/90 rounded-xl flex flex-col gap-0.5"
          >
            {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
            <span className="text-xs">Scan Food</span>
          </Button>
          <Button
            onClick={handleBarcodeScan}
            disabled={isScanning}
            variant="outline"
            className="flex-1 h-14 rounded-xl flex flex-col gap-0.5"
          >
            <span className="text-lg">||||</span>
            <span className="text-xs">Barcode</span>
          </Button>
          <Button
            onClick={handleVoice}
            variant="outline"
            className="flex-1 h-14 rounded-xl flex flex-col gap-0.5"
          >
            <Mic className="w-5 h-5 text-nutrio-blue" />
            <span className="text-xs">Voice</span>
          </Button>
        </motion.div>

        {/* Logged Meals or Empty State */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          {todaysMeals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No meals logged today</p>
              <Button onClick={() => setFoodLogModalOpen(true)} className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Log your first meal
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Today's Meals</h3>
              {todaysMeals.map((meal) => (
                <div key={meal.id} className="bg-card rounded-xl p-4 shadow-card flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{meal.food_name}</p>
                    <p className="text-sm text-muted-foreground">{meal.calories} kcal</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMealType(meal.meal_type as MealType);
                      setMealDetailsModalOpen(true);
                    }}
                    className="text-primary text-sm font-medium"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <BottomNav />

      <FoodLogModal
        isOpen={foodLogModalOpen}
        onClose={() => setFoodLogModalOpen(false)}
        mealType={selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
        onLogFood={handleLogFood}
      />

      <MealDetailsModal
        isOpen={mealDetailsModalOpen}
        onClose={() => setMealDetailsModalOpen(false)}
        mealType={selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
        foods={dailySummary.meals[selectedMealType]}
        onDeleteFood={deleteFood}
        onEditFood={editFood}
        onAddFood={() => { setMealDetailsModalOpen(false); setFoodLogModalOpen(true); }}
        onGetAISuggestions={() => toast.info("AI suggestions coming soon!")}
      />
    </div>
  );
};

export default Log;