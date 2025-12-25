import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { WorkoutCategory } from "@/data/workoutData";

interface WorkoutCategoryCardProps {
  category: WorkoutCategory;
  onClick: () => void;
  index: number;
}

export const WorkoutCategoryCard = ({ category, onClick, index }: WorkoutCategoryCardProps) => {
  const totalWorkouts = category.subcategories.reduce(
    (sum, sub) => sum + sub.workouts.length, 0
  );

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      onClick={onClick}
      className="w-full bg-card rounded-2xl p-4 shadow-card text-left hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl">
          {category.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground text-lg">{category.name}</h3>
          <p className="text-sm text-muted-foreground">
            {category.subcategories.length} types • {totalWorkouts} workouts
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </motion.button>
  );
};
