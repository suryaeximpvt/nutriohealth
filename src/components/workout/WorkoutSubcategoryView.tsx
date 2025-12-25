import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { WorkoutCategory } from "@/data/workoutData";
import { WorkoutCard } from "./WorkoutCard";

interface WorkoutSubcategoryViewProps {
  category: WorkoutCategory;
  onBack: () => void;
  onStartWorkout: (workoutId: string) => void;
}

export const WorkoutSubcategoryView = ({ 
  category, 
  onBack, 
  onStartWorkout 
}: WorkoutSubcategoryViewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.icon}</span>
          <h2 className="text-xl font-bold text-foreground">{category.name}</h2>
        </div>
      </div>

      {/* Subcategories */}
      <div className="space-y-6">
        {category.subcategories.map((subcategory) => (
          <div key={subcategory.id}>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              {subcategory.name}
              <span className="text-sm font-normal text-muted-foreground">
                ({subcategory.workouts.length} workouts)
              </span>
            </h3>
            <div className="space-y-3">
              {subcategory.workouts.map((workout, index) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onStart={() => onStartWorkout(workout.id)}
                  index={index}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
