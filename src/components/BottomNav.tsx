import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, User, Plus, Salad } from "lucide-react";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/diet", icon: Salad, label: "Diet" },
  ];

  const rightNavItems = [
    { path: "/workout", icon: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.4 14.4 9.6 9.6M18 6 6 18M8 6H6v2M6 16v2h2M16 18h2v-2M18 8V6h-2" />
      </svg>
    ), label: "Workout", customIcon: true },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="container max-w-lg mx-auto relative">
        <div className="flex items-center justify-around py-2">
          {/* Left nav items */}
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 py-2 px-4 min-w-[64px]"
              >
                <motion.div
                  className={`transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
                  animate={{ scale: active ? 1.1 : 1 }}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
                <span className={`text-xs font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Center FAB button */}
          <div className="flex flex-col items-center gap-1 py-2 px-4">
            <motion.button
              onClick={() => navigate("/log")}
              className="w-14 h-14 -mt-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              <Plus className="w-7 h-7" />
            </motion.button>
          </div>

          {/* Right nav items */}
          {rightNavItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 py-2 px-4 min-w-[64px]"
              >
                <motion.div
                  className={`transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
                  animate={{ scale: active ? 1.1 : 1 }}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
                <span className={`text-xs font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export { BottomNav };