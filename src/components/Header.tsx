import { motion } from "framer-motion";
import { Bell, Settings } from "lucide-react";

interface HeaderProps {
  userName?: string;
  greeting?: string;
}

export const Header = ({
  userName = "there",
  greeting,
}: HeaderProps) => {
  const getGreeting = () => {
    if (greeting) return greeting;
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between py-4"
    >
      <div>
        <p className="text-sm text-muted-foreground">{getGreeting()}</p>
        <h1 className="text-xl font-bold text-foreground">{userName}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-card">
          <Bell className="w-5 h-5" />
        </button>
        <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-card">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </motion.header>
  );
};
