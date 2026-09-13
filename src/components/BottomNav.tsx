import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Salad, Sparkles, Dumbbell, ShoppingBag } from "lucide-react";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/diet", icon: Salad, label: "Diet" },
    { path: "/ask-ai", icon: Sparkles, label: "Ask AI", isCenter: true },
    { path: "/workout", icon: Dumbbell, label: "Workout" },
    { path: "/shop", icon: ShoppingBag, label: "Shop" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border shadow-elevated safe-area-bottom">
      <div className="container max-w-lg mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            
            if (item.isCenter) {
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-1 py-2 px-4"
                >
                  <motion.div
                    className="w-14 h-14 -mt-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-elevated ring-4 ring-card"
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                  <span className={`text-xs font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                    {item.label}
                  </span>
                </button>
              );
            }

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
