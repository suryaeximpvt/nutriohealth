import { motion } from "framer-motion";
import { Heart, Footprints, Flame, Activity } from "lucide-react";

interface HealthStatsProps {
  heartRate?: number;
  steps?: number;
  activeCalories?: number;
  isConnected?: boolean;
}

export const HealthStats = ({
  heartRate = 72,
  steps = 4250,
  activeCalories = 180,
  isConnected = false,
}: HealthStatsProps) => {
  const stats = [
    {
      icon: Heart,
      label: "Heart Rate",
      value: heartRate,
      unit: "bpm",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      icon: Footprints,
      label: "Steps",
      value: steps.toLocaleString(),
      unit: "",
      color: "text-nutrio-blue",
      bgColor: "bg-nutrio-blue/10",
    },
    {
      icon: Flame,
      label: "Active Cal",
      value: activeCalories,
      unit: "kcal",
      color: "text-nutrio-orange",
      bgColor: "bg-nutrio-orange/10",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-4 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Health Stats</h3>
        {!isConnected && (
          <button className="flex items-center gap-1 text-xs text-primary font-medium px-2 py-1 bg-primary/10 rounded-full">
            <Activity className="w-3 h-3" />
            Connect Health
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="font-bold text-foreground text-sm">
              {stat.value}
              <span className="text-xs text-muted-foreground ml-0.5">{stat.unit}</span>
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>
      
      {!isConnected && (
        <p className="text-xs text-muted-foreground text-center mt-3 pt-3 border-t border-border">
          Demo data • Connect Apple Health in native app
        </p>
      )}
    </motion.div>
  );
};
