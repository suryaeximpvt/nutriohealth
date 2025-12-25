import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dumbbell, 
  Flame, 
  Clock, 
  Plus, 
  X, 
  ChevronLeft, 
  Zap, 
  Heart, 
  Bike, 
  PersonStanding,
  Loader2,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
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

const EXERCISE_PRESETS = [
  { name: "Running", type: "cardio", icon: PersonStanding, caloriesPerMin: 10 },
  { name: "Cycling", type: "cardio", icon: Bike, caloriesPerMin: 8 },
  { name: "Weight Training", type: "strength", icon: Dumbbell, caloriesPerMin: 6 },
  { name: "HIIT", type: "cardio", icon: Zap, caloriesPerMin: 12 },
  { name: "Walking", type: "cardio", icon: PersonStanding, caloriesPerMin: 4 },
  { name: "Swimming", type: "cardio", icon: Heart, caloriesPerMin: 9 },
  { name: "Yoga", type: "flexibility", icon: Heart, caloriesPerMin: 3 },
  { name: "Boxing", type: "cardio", icon: Zap, caloriesPerMin: 11 },
];

const Workout = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<typeof EXERCISE_PRESETS[0] | null>(null);
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState<"light" | "moderate" | "intense">("moderate");
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const fetchWorkouts = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("logged_at", today)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching workouts:", error);
      return;
    }

    setWorkouts(data || []);
    setLoading(false);
  }, [user, today]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchWorkouts();
    }
  }, [user, fetchWorkouts]);

  const calculateCalories = (minutes: number, baseCalories: number) => {
    const multipliers = { light: 0.75, moderate: 1, intense: 1.3 };
    return Math.round(minutes * baseCalories * multipliers[intensity]);
  };

  const handleAddWorkout = async () => {
    if (!user || !selectedExercise) return;
    
    setSaving(true);
    const caloriesBurned = calculateCalories(duration, selectedExercise.caloriesPerMin);

    const { error } = await supabase.from("workout_logs").insert({
      user_id: user.id,
      exercise_name: selectedExercise.name,
      duration_minutes: duration,
      calories_burned: caloriesBurned,
      exercise_type: selectedExercise.type,
      intensity,
      logged_at: today,
    });

    setSaving(false);

    if (error) {
      toast.error("Failed to log workout");
      return;
    }

    toast.success(`${selectedExercise.name} logged! ${caloriesBurned} calories burned.`);
    setShowAddModal(false);
    setSelectedExercise(null);
    setDuration(30);
    setIntensity("moderate");
    fetchWorkouts();
  };

  const handleDeleteWorkout = async (id: string) => {
    const { error } = await supabase.from("workout_logs").delete().eq("id", id);
    
    if (error) {
      toast.error("Failed to delete workout");
      return;
    }

    toast.success("Workout deleted");
    fetchWorkouts();
  };

  const totalCaloriesBurned = workouts.reduce((sum, w) => sum + w.calories_burned, 0);
  const totalMinutes = workouts.reduce((sum, w) => sum + w.duration_minutes, 0);

  if (authLoading || loading) {
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
        {/* Header */}
        <header className="py-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/")}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Workouts</h1>
              <p className="text-sm text-muted-foreground">Track your exercises</p>
            </div>
          </div>
        </header>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-nutrio-coral/10 flex items-center justify-center mx-auto mb-2">
              <Flame className="w-5 h-5 text-nutrio-coral" />
            </div>
            <p className="text-2xl font-bold text-foreground">{totalCaloriesBurned}</p>
            <p className="text-sm text-muted-foreground">Calories Burned</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{totalMinutes}</p>
            <p className="text-sm text-muted-foreground">Minutes Active</p>
          </div>
        </motion.div>

        {/* Add Workout Button */}
        <Button 
          onClick={() => setShowAddModal(true)} 
          className="w-full mb-6"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Log Workout
        </Button>

        {/* Today's Workouts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-semibold text-foreground mb-3">Today's Workouts</h2>
          
          {workouts.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center">
              <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No workouts logged today</p>
              <p className="text-sm text-muted-foreground mt-1">Tap "Log Workout" to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workouts.map((workout, index) => {
                const preset = EXERCISE_PRESETS.find(p => p.name === workout.exercise_name);
                const Icon = preset?.icon || Dumbbell;
                
                return (
                  <motion.div
                    key={workout.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{workout.exercise_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {workout.duration_minutes} min • {workout.intensity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-nutrio-coral">{workout.calories_burned}</p>
                        <p className="text-xs text-muted-foreground">kcal</p>
                      </div>
                      <button
                        onClick={() => handleDeleteWorkout(workout.id)}
                        className="w-8 h-8 rounded-full hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>
      </div>

      <BottomNav activeTab="workout" onTabChange={(tab) => {
        if (tab === "home") navigate("/");
        else if (tab === "workout") {/* already here */}
        else toast.info("Coming soon!");
      }} />

      {/* Add Workout Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[90vh] overflow-hidden"
            >
              <div className="sticky top-0 bg-card z-10 px-6 pt-4 pb-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Log Workout</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="w-12 h-1 bg-muted rounded-full mx-auto mt-3" />
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-80px)] px-6 py-4">
                {!selectedExercise ? (
                  <>
                    <p className="text-muted-foreground mb-4">Choose an exercise</p>
                    <div className="grid grid-cols-2 gap-3">
                      {EXERCISE_PRESETS.map((exercise) => (
                        <button
                          key={exercise.name}
                          onClick={() => setSelectedExercise(exercise)}
                          className="p-4 rounded-xl border-2 border-border hover:border-primary transition-all text-left"
                        >
                          <exercise.icon className="w-6 h-6 text-primary mb-2" />
                          <p className="font-medium text-foreground">{exercise.name}</p>
                          <p className="text-xs text-muted-foreground">{exercise.type}</p>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
                      <selectedExercise.icon className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">{selectedExercise.name}</p>
                        <button 
                          onClick={() => setSelectedExercise(null)}
                          className="text-sm text-primary"
                        >
                          Change exercise
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Duration (minutes)</Label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDuration(Math.max(5, duration - 5))}
                        >
                          -5
                        </Button>
                        <Input
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                          className="text-center text-lg font-semibold"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDuration(duration + 5)}
                        >
                          +5
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Intensity</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["light", "moderate", "intense"] as const).map((level) => (
                          <button
                            key={level}
                            onClick={() => setIntensity(level)}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              intensity === level
                                ? "border-primary bg-primary/5"
                                : "border-border"
                            }`}
                          >
                            <p className="font-medium text-foreground capitalize">{level}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-nutrio-coral-light rounded-xl text-center">
                      <p className="text-sm text-muted-foreground">Estimated calories burned</p>
                      <p className="text-3xl font-bold text-nutrio-coral">
                        {calculateCalories(duration, selectedExercise.caloriesPerMin)}
                      </p>
                      <p className="text-sm text-muted-foreground">kcal</p>
                    </div>

                    <Button 
                      onClick={handleAddWorkout} 
                      className="w-full" 
                      size="lg"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 mr-2" />
                          Log Workout
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Workout;
