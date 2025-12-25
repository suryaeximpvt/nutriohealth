import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, ChevronRight, Sparkles, Crown } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { ProgressRing } from "@/components/ProgressRing";
import { MacroBar } from "@/components/MacroBar";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, dailySummary, loading: dataLoading } = useUserData();

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

  const calorieTarget = profile?.calorie_target || 2000;
  const caloriesConsumed = dailySummary.totalCalories;
  const caloriesRemaining = Math.max(0, calorieTarget - caloriesConsumed);
  const calorieProgress = Math.min((caloriesConsumed / calorieTarget) * 100, 100);
  const userName = profile?.full_name?.split(" ")[0] || "there";

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

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
          onClick={() => navigate("/log")}
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

        {/* Go Premium Card */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
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
              <p className="text-primary-foreground/80 text-sm">Unlock AI coach & personalized plans</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-primary-foreground" />
        </motion.button>

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

          <div className="flex justify-center mb-6">
            <ProgressRing
              progress={calorieProgress}
              size={180}
              strokeWidth={12}
              color="hsl(var(--primary))"
            >
              <div className="text-center">
                <p className="text-4xl font-bold text-foreground">{caloriesRemaining}</p>
                <p className="text-muted-foreground text-sm">Remaining</p>
              </div>
            </ProgressRing>
          </div>

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

        {/* Macronutrients Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card rounded-2xl p-5 shadow-card"
        >
          <h2 className="font-bold text-foreground mb-4">Macronutrients</h2>
          <div className="space-y-4">
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
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;