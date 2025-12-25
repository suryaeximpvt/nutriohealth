import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ChevronRight, Flame } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { Loader2 } from "lucide-react";

const CATEGORIES = ["All", "Beverages", "Dairy", "Fruits", "Grains", "Protein", "Vegetables"];

const RECOMMENDED_MEALS = [
  { name: "Mediterranean Bowl", calories: 420, emoji: "🥗" },
  { name: "Grilled Salmon & Veggies", calories: 380, emoji: "🐟" },
  { name: "Protein Smoothie Bowl", calories: 320, emoji: "🍓" },
  { name: "Chicken Caesar Salad", calories: 350, emoji: "🥬" },
  { name: "Quinoa Buddha Bowl", calories: 400, emoji: "🥙" },
];

const Diet = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: dataLoading } = useUserData();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const userName = profile?.full_name?.split(" ")[0] || "there";

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

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
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-foreground">Diet Plans</h1>
          <p className="text-muted-foreground">Discover healthy meal ideas</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border border-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Recommended Meals */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-bold text-foreground mb-4">Recommended Meals</h2>
          <div className="space-y-3">
            {RECOMMENDED_MEALS.map((meal, index) => (
              <motion.button
                key={meal.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + index * 0.05 }}
                onClick={() => navigate("/log")}
                className="w-full bg-card rounded-2xl p-4 flex items-center gap-4 shadow-card"
              >
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl">
                  {meal.emoji}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-foreground">{meal.name}</h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Flame className="w-4 h-4 text-nutrio-coral" />
                    <span>{meal.calories} kcal</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Food Database */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground">Food Database</h2>
            <button className="text-primary text-sm font-medium">Browse All</button>
          </div>
        </motion.section>
      </div>

      <BottomNav />
    </div>
  );
};

export default Diet;