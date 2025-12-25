import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Flame, Trophy, Loader2, History } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { ProgressRing } from "@/components/ProgressRing";
import { WorkoutCategoryCard } from "@/components/workout/WorkoutCategoryCard";
import { WorkoutSubcategoryView } from "@/components/workout/WorkoutSubcategoryView";
import { WorkoutPlayer } from "@/components/workout/WorkoutPlayer";
import { WorkoutCard } from "@/components/workout/WorkoutCard";
import { AIRecommendedWorkout } from "@/components/workout/AIRecommendedWorkout";
import { WORKOUT_CATEGORIES, getWorkoutById, WorkoutCategory, Workout as WorkoutType } from "@/data/workoutData";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { supabase } from "@/integrations/supabase/client";

interface WorkoutLog {
  id: string;
  exercise_name: string;
  duration_minutes: number;
  calories_burned: number;
  exercise_type: string;
  intensity: string;
  logged_at: string;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type View = 'main' | 'category' | 'player' | 'history';

const Workout = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: dataLoading } = useUserData();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('main');
  const [selectedCategory, setSelectedCategory] = useState<WorkoutCategory | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutType | null>(null);

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
  
  // Calculate weekly workouts (unique days with workouts this week)
  const getWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday as start
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };

  const weekStart = getWeekStart();
  const weeklyWorkoutDays = new Set(
    workouts
      .filter(w => new Date(w.logged_at) >= weekStart)
      .map(w => w.logged_at)
  );
  const weeklyWorkouts = weeklyWorkoutDays.size;

  // Calculate streak
  const calculateStreak = () => {
    let streak = 0;
    const sortedDates = [...new Set(workouts.map(w => w.logged_at))].sort().reverse();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const date = new Date(sortedDates[i]);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else if (i === 0 && date.toISOString().split('T')[0] === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  // Weekly progress checkmarks
  const getWeeklyProgress = () => {
    const progress = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      progress.push(weeklyWorkoutDays.has(dateStr));
    }
    return progress;
  };

  const weeklyProgress = getWeeklyProgress();

  const handleCategoryClick = (category: WorkoutCategory) => {
    setSelectedCategory(category);
    setView('category');
  };

  const handleStartWorkout = (workoutId: string) => {
    const workout = getWorkoutById(workoutId);
    if (workout) {
      setActiveWorkout(workout);
      setView('player');
    }
  };

  const handleWorkoutComplete = () => {
    setActiveWorkout(null);
    setView('main');
    fetchWorkouts();
  };

  if (authLoading || (user && (dataLoading || loading))) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  // Show workout player fullscreen
  if (view === 'player' && activeWorkout) {
    return (
      <WorkoutPlayer
        workout={activeWorkout}
        onClose={() => {
          setActiveWorkout(null);
          setView('main');
        }}
        onComplete={handleWorkoutComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-lg mx-auto px-4">
        <AppHeader userName={userName} />

        <AnimatePresence mode="wait">
          {view === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
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
                className="flex gap-3 mb-6"
              >
                <div className="flex-1 bg-card rounded-xl p-4 shadow-card text-center">
                  <Flame className="w-6 h-6 text-nutrio-coral mx-auto mb-1" />
                  <p className="font-bold text-foreground">{totalCaloriesBurned.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">kcal today</p>
                </div>
                <div className="flex-1 bg-card rounded-xl p-4 shadow-card text-center">
                  <Clock className="w-6 h-6 text-nutrio-blue mx-auto mb-1" />
                  <p className="font-bold text-foreground">{totalMinutes}</p>
                  <p className="text-xs text-muted-foreground">min today</p>
                </div>
                <div className="flex-1 bg-card rounded-xl p-4 shadow-card text-center">
                  <Trophy className="w-6 h-6 text-nutrio-amber mx-auto mb-1" />
                  <p className="font-bold text-foreground">{streak}</p>
                  <p className="text-xs text-muted-foreground">day streak</p>
                </div>
              </motion.div>

              {/* AI Recommended Workout */}
              <AIRecommendedWorkout
                onStartWorkout={handleStartWorkout}
                recentWorkouts={workouts.map(w => ({ 
                  exercise_type: w.exercise_type, 
                  logged_at: w.logged_at 
                }))}
              />

              {/* Workout Categories */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-lg text-foreground">Workout Categories</h2>
                  <button 
                    onClick={() => setView('history')}
                    className="flex items-center gap-1 text-sm text-primary font-medium"
                  >
                    <History className="w-4 h-4" />
                    History
                  </button>
                </div>
                <div className="space-y-3">
                  {WORKOUT_CATEGORIES.map((category, index) => (
                    <WorkoutCategoryCard
                      key={category.id}
                      category={category}
                      onClick={() => handleCategoryClick(category)}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {view === 'category' && selectedCategory && (
            <WorkoutSubcategoryView
              key="category"
              category={selectedCategory}
              onBack={() => {
                setSelectedCategory(null);
                setView('main');
              }}
              onStartWorkout={handleStartWorkout}
            />
          )}

          {view === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <button 
                  onClick={() => setView('main')}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-xl font-bold text-foreground">Workout History</h2>
              </div>

              {workouts.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No workout history yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Start a workout to track your progress</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workouts.map((w) => (
                    <motion.div
                      key={w.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card rounded-xl p-4 shadow-card"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{w.exercise_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {w.duration_minutes} min • {w.exercise_type} • {w.intensity}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(w.logged_at).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-nutrio-coral text-lg">{w.calories_burned}</p>
                          <p className="text-xs text-muted-foreground">kcal</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
};

export default Workout;
