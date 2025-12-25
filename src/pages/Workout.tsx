import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Flame, Trophy, Play, ChevronRight, X, Plus, Loader2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { ProgressRing } from "@/components/ProgressRing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WorkoutLog {
  id: string;
  exercise_name: string;
  duration_minutes: number;
  calories_burned: number;
  exercise_type: string;
  intensity: string;
  logged_at: string;
}

const WORKOUT_PLANS = [
  { name: "Full Body Strength", emoji: "💪", duration: 45, calories: 320, exercises: 12, level: "Intermediate", levelColor: "bg-nutrio-coral/10 text-nutrio-coral" },
  { name: "HIIT Cardio Blast", emoji: "🔥", duration: 30, calories: 400, exercises: 8, level: "Advanced", levelColor: "bg-destructive/10 text-destructive" },
  { name: "Core & Abs", emoji: "🎯", duration: 20, calories: 180, exercises: 10, level: "Beginner", levelColor: "bg-primary/10 text-primary" },
  { name: "Morning Yoga Flow", emoji: "🧘", duration: 25, calories: 120, exercises: 15, level: "Beginner", levelColor: "bg-primary/10 text-primary" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const Workout = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: dataLoading } = useUserData();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"plans" | "history">("plans");
  const [showAddModal, setShowAddModal] = useState(false);

  const userName = profile?.full_name?.split(" ")[0] || "there";
  const today = new Date().toISOString().split("T")[0];

  const fetchWorkouts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(30);
    setWorkouts(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchWorkouts();
  }, [user, fetchWorkouts]);

  const todayWorkouts = workouts.filter(w => w.logged_at === today);
  const totalCaloriesBurned = todayWorkouts.reduce((sum, w) => sum + w.calories_burned, 0);
  const totalMinutes = todayWorkouts.reduce((sum, w) => sum + w.duration_minutes, 0);
  const weeklyWorkouts = 4; // Placeholder - would calculate from actual data
  const streak = 5; // Placeholder

  // Weekly goal checkmarks (placeholder data)
  const weeklyProgress = [true, true, false, true, true, false, false];

  if (authLoading || (user && (dataLoading || loading))) {
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

        {/* Weekly Goal Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 mb-4"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-bold text-primary-foreground text-lg">Weekly Goal</h2>
              <p className="text-primary-foreground/80 text-sm">{weeklyWorkouts} of 5 workouts completed</p>
            </div>
            <ProgressRing progress={(weeklyWorkouts / 5) * 100} size={56} strokeWidth={6} color="hsl(var(--primary-foreground))">
              <span className="text-xs font-bold text-primary-foreground">{weeklyWorkouts}/5</span>
            </ProgressRing>
          </div>
          <div className="flex justify-between">
            {DAYS.map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-1">
                <span className="text-primary-foreground/70 text-xs">{day}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  weeklyProgress[i] ? "bg-primary-foreground/20" : "bg-primary-foreground/10"
                }`}>
                  {weeklyProgress[i] ? (
                    <span className="text-primary-foreground text-sm">✓</span>
                  ) : (
                    <span className="text-primary-foreground/50 text-sm">-</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-4"
        >
          <div className="flex-1 bg-card rounded-xl p-4 shadow-card text-center">
            <Flame className="w-6 h-6 text-nutrio-coral mx-auto mb-1" />
            <p className="font-bold text-foreground">{totalCaloriesBurned.toLocaleString()} kcal</p>
            <p className="text-xs text-muted-foreground">Burned</p>
          </div>
          <div className="flex-1 bg-card rounded-xl p-4 shadow-card text-center">
            <Clock className="w-6 h-6 text-nutrio-blue mx-auto mb-1" />
            <p className="font-bold text-foreground">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</p>
            <p className="text-xs text-muted-foreground">Duration</p>
          </div>
          <div className="flex-1 bg-card rounded-xl p-4 shadow-card text-center">
            <Trophy className="w-6 h-6 text-nutrio-amber mx-auto mb-1" />
            <p className="font-bold text-foreground">{streak} days</p>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
        </motion.div>

        {/* Plans / History Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 mb-4"
        >
          <button
            onClick={() => setActiveTab("plans")}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "plans" ? "bg-card text-foreground shadow-card" : "text-muted-foreground"
            }`}
          >
            Workout Plans
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "history" ? "bg-card text-foreground shadow-card" : "text-muted-foreground"
            }`}
          >
            History
          </button>
        </motion.div>

        {/* Workout Plans */}
        {activeTab === "plans" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {WORKOUT_PLANS.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="bg-card rounded-2xl p-4 shadow-card"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl">
                    {plan.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{plan.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {plan.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3" /> {plan.calories} kcal
                      </span>
                      <span>{plan.exercises} exercises</span>
                    </div>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${plan.levelColor}`}>
                      {plan.level}
                    </span>
                  </div>
                  <button
                    onClick={() => toast.info("Workout player coming soon!")}
                    className="w-12 h-12 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* History */}
        {activeTab === "history" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {workouts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No workout history yet</p>
              </div>
            ) : (
              workouts.slice(0, 10).map((w) => (
                <div key={w.id} className="bg-card rounded-xl p-4 shadow-card flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{w.exercise_name}</p>
                    <p className="text-sm text-muted-foreground">{w.duration_minutes} min • {w.intensity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-nutrio-coral">{w.calories_burned}</p>
                    <p className="text-xs text-muted-foreground">kcal</p>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Workout;