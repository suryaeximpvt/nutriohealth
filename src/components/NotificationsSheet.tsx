import { motion } from "framer-motion";
import { Bell, BellOff, Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSmartReminders, type SmartReminder } from "@/hooks/useSmartReminders";

const PRIORITY_STYLE: Record<string, string> = {
  high: "border-primary/30 bg-primary/5",
  medium: "border-nutrio-amber/30 bg-nutrio-amber/5",
  low: "border-border bg-muted/40",
};

interface NotificationsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  loggedCounts?: Record<string, number>;
  waterGlasses?: number;
}

export const NotificationsSheet = ({
  isOpen,
  onClose,
  loggedCounts,
  waterGlasses,
}: NotificationsSheetProps) => {
  const { reminders, acknowledge } = useSmartReminders({ loggedCounts, waterGlasses });

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {reminders.length === 0 ? (
            <div className="text-center py-16">
              <BellOff className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold text-foreground">You're all caught up</p>
              <p className="text-sm text-muted-foreground mt-1">
                Nutrio will let you know when something needs you.
              </p>
            </div>
          ) : (
            reminders.map((r: SmartReminder, i) => (
              <motion.div
                key={`${r.title}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl border p-4 ${PRIORITY_STYLE[r.priority]}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{r.title}</p>
                    <p className="text-sm text-muted-foreground">{r.body}</p>
                  </div>
                  <button
                    onClick={() => acknowledge(r, false)}
                    aria-label="Mark as done"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
