import { motion } from "framer-motion";
import { Clock, Flame, Play, Dumbbell } from "lucide-react";
import { Workout } from "@/data/workoutData";

interface WorkoutCardProps {
  workout: Workout;
  onStart: () => void;
  index?: number;
  featured?: boolean;
}

const levelColors = {
  Beginner: "bg-primary/10 text-primary",
  Intermediate: "bg-nutrio-amber/10 text-nutrio-amber",
  Advanced: "bg-nutrio-coral/10 text-nutrio-coral"
};

export const WorkoutCard = ({ workout, onStart, index = 0, featured = false }: WorkoutCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      className={`bg-card rounded-2xl shadow-card overflow-hidden ${featured ? 'border-2 border-primary' : ''}`}
    >
      {featured && (
        <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-primary-foreground text-sm font-medium">✨ AI Recommended</span>
          </div>
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-lg leading-tight">{workout.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{workout.description}</p>
            
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {workout.duration} min
              </span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Flame className="w-4 h-4 text-nutrio-coral" />
                {workout.calories} kcal
              </span>
              <span className="text-sm text-muted-foreground">
                {workout.exercises.length} exercises
              </span>
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${levelColors[workout.level]}`}>
                {workout.level}
              </span>
              <span className="text-xs text-muted-foreground">{workout.subcategory}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={onStart}
          className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <Play className="w-5 h-5" />
          Start Workout
        </button>
      </div>
    </motion.div>
  );
};
