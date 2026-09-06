import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Crown } from "lucide-react";
import { QuickActionMenu } from "./QuickActionMenu";
import { WaterIntakeModal } from "./WaterIntakeModal";
import { useUserData } from "@/hooks/useUserData";

interface AppHeaderProps {
  userName?: string;
}

export const AppHeader = ({ userName = "there" }: AppHeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [waterModalOpen, setWaterModalOpen] = useState(false);
  const { waterGlasses, updateWater } = useUserData();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning 🌅";
    if (hour < 17) return "Good Afternoon ☀️";
    return "Good Evening 🌙";
  };

  const firstLetter = userName.charAt(0).toUpperCase();

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 -mx-4 px-4 py-3 mb-4 flex items-center justify-between bg-background/95 backdrop-blur border-b border-border"
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMenuOpen(true)}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold cursor-pointer"
          >
            {firstLetter}
          </motion.button>
          <div>
            <p className="text-sm text-muted-foreground">{getGreeting()}</p>
            <h1 className="text-lg font-bold text-foreground">{userName}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-nutrio-sage-light flex items-center justify-center">
            <Crown className="w-5 h-5 text-nutrio-amber" />
          </button>
          <button className="w-10 h-10 rounded-full bg-nutrio-sage-light flex items-center justify-center relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
          </button>
        </div>
      </motion.header>

      <QuickActionMenu 
        isOpen={menuOpen} 
        onClose={() => setMenuOpen(false)} 
        onOpenWaterTracker={() => setWaterModalOpen(true)}
      />

      <WaterIntakeModal
        isOpen={waterModalOpen}
        onClose={() => setWaterModalOpen(false)}
        waterGlasses={waterGlasses}
        onUpdateWater={updateWater}
      />
    </>
  );
};
