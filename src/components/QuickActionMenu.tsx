import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Settings, Target, Droplets, Bell, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface QuickActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWaterTracker: () => void;
}

export const QuickActionMenu = ({ isOpen, onClose, onOpenWaterTracker }: QuickActionMenuProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
    onClose();
  };

  const menuItems = [
    { 
      icon: User, 
      label: "Profile", 
      desc: "View and edit your profile",
      onClick: () => { navigate("/profile"); onClose(); },
       color: "text-foreground"
    },
    { 
      icon: Settings, 
      label: "Settings", 
      desc: "App preferences & account",
      onClick: () => { navigate("/settings?tab=account"); onClose(); },
       color: "text-foreground"
    },
    { 
      icon: Target, 
      label: "Goals & Preferences", 
      desc: "Update your fitness goals",
      onClick: () => { navigate("/settings?tab=preferences"); onClose(); },
       color: "text-foreground"
    },
    { 
      icon: Droplets, 
      label: "Water Intake Tracker", 
      desc: "Track your hydration",
      onClick: () => { onOpenWaterTracker(); onClose(); },
       color: "text-foreground"
    },
    { 
      icon: Bell, 
      label: "Notifications", 
      desc: "Manage reminders",
      onClick: () => { navigate("/settings?tab=notifications"); onClose(); },
       color: "text-foreground"
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-3xl h-auto max-h-[80vh]">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-left">Quick Actions</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-2 pb-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                 transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 }}
                onClick={item.onClick}
                className="w-full p-4 rounded-xl bg-muted/50 hover:bg-muted flex items-center gap-4 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl bg-background flex items-center justify-center ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            );
          })}

          {/* Logout Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
             transition={{ type: "spring", stiffness: 300, damping: 30, delay: menuItems.length * 0.05 }}
            onClick={handleSignOut}
            className="w-full p-4 rounded-xl bg-destructive/10 hover:bg-destructive/20 flex items-center gap-4 transition-colors mt-4"
          >
            <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center text-destructive">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-destructive">Logout</p>
              <p className="text-xs text-destructive/70">Sign out of your account</p>
            </div>
          </motion.button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
