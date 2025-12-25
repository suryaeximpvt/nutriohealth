import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { WorkoutCard } from "./WorkoutCard";
import { Workout, getAllWorkouts } from "@/data/workoutData";
import { useUserData } from "@/hooks/useUserData";

interface AIRecommendedWorkoutProps {
  onStartWorkout: (workoutId: string) => void;
  recentWorkouts: { exercise_type: string; logged_at: string }[];
}

export const AIRecommendedWorkout = ({ 
  onStartWorkout,
  recentWorkouts 
}: AIRecommendedWorkoutProps) => {
  const { profile, dailySummary } = useUserData();
  const [recommendation, setRecommendation] = useState<Workout | null>(null);
  const [reasoning, setReasoning] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const generateRecommendation = () => {
    setLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const allWorkouts = getAllWorkouts();
      const today = new Date().getDay(); // 0 = Sunday
      
      // Get recently trained muscle groups (last 2 days)
      const recentTypes = new Set(
        recentWorkouts
          .filter(w => {
            const date = new Date(w.logged_at);
            const diffDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
            return diffDays <= 2;
          })
          .map(w => w.exercise_type.toLowerCase())
      );

      // User goals and fitness level
      const userGoal = profile?.goal?.toLowerCase() || 'balanced';
      const activityLevel = profile?.activity_level?.toLowerCase() || 'moderate';
      
      // Calories remaining affects workout intensity
      const caloriesRemaining = (profile?.calorie_target || 2000) - (dailySummary?.totalCalories || 0);
      const needsCalorieBurn = caloriesRemaining > 500;

      // AI Logic for workout selection
      let selectedWorkout: Workout | undefined;
      let reason = "";

      // Prefer recovery on low activity days or if recently trained heavily
      if (today === 0 || today === 6 || recentTypes.size >= 3) {
        selectedWorkout = allWorkouts.find(w => 
          w.category === 'Yoga & Mobility' && 
          (w.level === 'Beginner' || w.subcategory === 'Recovery Yoga')
        );
        reason = "Recovery day recommended. Your body needs rest after recent training.";
      }
      // High calorie burn needed
      else if (needsCalorieBurn && userGoal === 'lose weight') {
        selectedWorkout = allWorkouts.find(w => 
          w.category === 'Endurance Training' && 
          w.calories >= 300
        );
        reason = "HIIT workout to maximize calorie burn and support your weight loss goal.";
      }
      // Muscle gain goal
      else if (userGoal === 'gain muscle') {
        // Find a strength workout that wasn't recently trained
        selectedWorkout = allWorkouts.find(w => 
          w.category === 'Strength Training' && 
          !recentTypes.has(w.subcategory.toLowerCase()) &&
          w.level !== 'Beginner'
        );
        reason = `Targeting ${selectedWorkout?.subcategory || 'muscles'} to support muscle growth.`;
      }
      // Balanced approach
      else {
        // Rotate through categories
        const categories = ['Strength Training', 'Endurance Training', 'Core & Abs', 'Yoga & Mobility'];
        const categoryIndex = today % categories.length;
        
        selectedWorkout = allWorkouts.find(w => 
          w.category === categories[categoryIndex] &&
          !recentTypes.has(w.subcategory.toLowerCase())
        );
        reason = `Balanced training plan. Today focuses on ${categories[categoryIndex].toLowerCase()}.`;
      }

      // Fallback
      if (!selectedWorkout) {
        selectedWorkout = allWorkouts[Math.floor(Math.random() * allWorkouts.length)];
        reason = "Great all-around workout to keep you active and healthy.";
      }

      // Adjust based on fitness level
      if (activityLevel === 'sedentary' && selectedWorkout.level === 'Advanced') {
        const easier = allWorkouts.find(w => 
          w.category === selectedWorkout!.category && 
          w.level !== 'Advanced'
        );
        if (easier) {
          selectedWorkout = easier;
          reason += " Adjusted for your current fitness level.";
        }
      }

      setRecommendation(selectedWorkout);
      setReasoning(reason);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    generateRecommendation();
  }, [recentWorkouts, profile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg text-foreground">Suits You Best</h2>
        </div>
        <button 
          onClick={generateRecommendation}
          disabled={loading}
          className="p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="bg-card rounded-2xl p-8 shadow-card flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-muted-foreground">Analyzing your profile...</p>
        </div>
      ) : recommendation ? (
        <div className="space-y-3">
          <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
            <p className="text-sm text-foreground">
              <Sparkles className="w-4 h-4 text-primary inline mr-1" />
              <span className="font-medium">AI Insight:</span> {reasoning}
            </p>
          </div>
          <WorkoutCard
            workout={recommendation}
            onStart={() => onStartWorkout(recommendation.id)}
            featured={true}
          />
        </div>
      ) : null}
    </motion.div>
  );
};
