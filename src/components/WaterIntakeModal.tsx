import { motion } from "framer-motion";
import { Droplets, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface WaterIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  waterGlasses: number;
  onUpdateWater: (glasses: number) => void;
}

export const WaterIntakeModal = ({ isOpen, onClose, waterGlasses, onUpdateWater }: WaterIntakeModalProps) => {
  const waterMl = waterGlasses * 250;
  const targetMl = 2000;
  const progress = Math.min((waterMl / targetMl) * 100, 100);

  const quickAddOptions = [
    { label: "250ml", glasses: 1, icon: "🥛" },
    { label: "500ml", glasses: 2, icon: "🍶" },
    { label: "1 Litre", glasses: 4, icon: "💧" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-3xl h-auto max-h-[80vh]">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-left flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-500" />
            Water Intake Tracker
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-6">
          {/* Progress Circle */}
          <div className="flex justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--cyan-500, 180 100% 50%))"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 2.83} ${283 - progress * 2.83}`}
                  initial={{ strokeDasharray: "0 283" }}
                  animate={{ strokeDasharray: `${progress * 2.83} ${283 - progress * 2.83}` }}
                  transition={{ duration: 0.5 }}
                  className="text-cyan-500"
                  style={{ stroke: "rgb(6, 182, 212)" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Droplets className="w-6 h-6 text-cyan-500 mb-1" />
                <p className="text-2xl font-bold text-foreground">{waterMl}ml</p>
                <p className="text-sm text-muted-foreground">of {targetMl}ml</p>
              </div>
            </div>
          </div>

          {/* Manual Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full"
              onClick={() => onUpdateWater(Math.max(0, waterGlasses - 1))}
              disabled={waterGlasses === 0}
            >
              <Minus className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{waterGlasses}</p>
              <p className="text-sm text-muted-foreground">glasses</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full"
              onClick={() => onUpdateWater(waterGlasses + 1)}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Quick Add Buttons */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Quick Add</p>
            <div className="grid grid-cols-3 gap-3">
              {quickAddOptions.map((option) => (
                <Button
                  key={option.label}
                  variant="outline"
                  onClick={() => onUpdateWater(waterGlasses + option.glasses)}
                  className="h-auto py-3 flex flex-col gap-1"
                >
                  <span className="text-xl">{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-cyan-500/10 rounded-xl p-4">
            <p className="text-sm text-cyan-600 dark:text-cyan-400">
              💡 Staying hydrated helps with energy levels, digestion, and keeping you feeling full between meals.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
