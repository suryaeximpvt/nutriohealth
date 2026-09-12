import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Crown } from "lucide-react";
import { QuickActionMenu } from "./QuickActionMenu";
import { NutrioLogo } from "./NutrioLogo";
import { NotificationsSheet } from "./NotificationsSheet";
import { useSmartReminders } from "@/hooks/useSmartReminders";
import { WaterIntakeModal } from "./WaterIntakeModal";
import { useUserData } from "@/hooks/useUserData";

interface AppHeaderProps {
  userName?: string;
}

export const AppHeader = ({ userName = "there" }: AppHeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [waterModalOpen, setWaterModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { waterGlasses, updateWater, dailySummary } = useUserData();
  const loggedCounts = {
    breakfast: dailySummary.meals.breakfast?.length ?? 0,
    lunch: dailySummary.meals.lunch?.length ?? 0,
    snacks: dailySummary.meals.snacks?.length ?? 0,
    dinner: dailySummary.meals.dinner?.length ?? 0,
  };
  const { reminders } = useSmartReminders({ loggedCounts, waterGlasses });

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
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="sticky top-0 z-40 -mx-4 px-4 py-3 mb-4 flex items-center justify-between bg-background/95 backdrop-blur-md border-b border-border/60"
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setMenuOpen(true)}
            aria-label="Open profile and quick actions menu"
            className="w-11 h-11 rounded-full bg-foreground text-background flex items-center justify-center text-base font-bold cursor-pointer shadow-card"
          >
            {firstLetter}
          </motion.button>
          <div>
            <p className="text-xs text-muted-foreground">{getGreeting()}</p>
            <p className="text-base font-bold text-foreground">{userName}</p>
          </div>
        </div>
        <NutrioLogo className="h-8 w-auto shrink-0" />
        <div className="flex items-center gap-2">
          <button
            aria-label="Nutrio Premium"
            className="w-11 h-11 rounded-full bg-muted flex items-center justify-center"
          >
            <Crown className="w-5 h-5 text-muted-foreground" />
          </button>

          <button
            onClick={() => setNotificationsOpen(true)}
            aria-label="Notifications"
            className="w-11 h-11 rounded-full bg-muted flex items-center justify-center relative"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {reminders.length > 0 && (
              <span className="absolute top-1 right-1 min-w-[1rem] h-4 px-1 rounded-full bg-destructive text-xs font-bold text-destructive-foreground flex items-center justify-center">
                {reminders.length}
              </span>
            )}
          </button>
        </div>
      </motion.header>

      <QuickActionMenu 
        isOpen={menuOpen} 
        onClose={() => setMenuOpen(false)} 
        onOpenWaterTracker={() => setWaterModalOpen(true)}
      />

      <NotificationsSheet
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        loggedCounts={loggedCounts}
        waterGlasses={waterGlasses}
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
