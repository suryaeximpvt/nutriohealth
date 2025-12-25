import { motion } from "framer-motion";
import { Bell, Droplets, UtensilsCrossed, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useNotifications } from "@/hooks/useNotifications";

export const NotificationSettings = () => {
  const { settings, updateSettings, permissionGranted, isNative } = useNotifications();

  if (!isNative) {
    return (
      <div className="bg-card rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Push Notifications</h3>
            <p className="text-sm text-muted-foreground">Available in the mobile app</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Download the Nutrio mobile app to receive water and meal reminders throughout the day.
        </p>
      </div>
    );
  }

  if (!permissionGranted) {
    return (
      <div className="bg-card rounded-2xl p-5 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Notifications Disabled</h3>
            <p className="text-sm text-muted-foreground">Enable in device settings</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Please enable notifications in your device settings to receive water and meal reminders.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 shadow-card space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Push Notifications</h3>
          <p className="text-sm text-muted-foreground">Stay on track with reminders</p>
        </div>
      </div>

      {/* Water Reminders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-nutrio-blue/10 flex items-center justify-center">
              <Droplets className="w-4 h-4 text-nutrio-blue" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Water Reminders</p>
              <p className="text-xs text-muted-foreground">Get reminded to stay hydrated</p>
            </div>
          </div>
          <Switch
            checked={settings.waterReminders}
            onCheckedChange={(checked) => updateSettings({ waterReminders: checked })}
          />
        </div>

        {settings.waterReminders && (
          <div className="pl-11 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Remind every</span>
              </div>
              <span className="text-sm font-medium text-foreground">{settings.waterInterval} hours</span>
            </div>
            <Slider
              value={[settings.waterInterval]}
              onValueChange={([value]) => updateSettings({ waterInterval: value })}
              min={1}
              max={4}
              step={1}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Meal Reminders */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-nutrio-orange/10 flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-nutrio-orange" />
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">Meal Reminders</p>
            <p className="text-xs text-muted-foreground">Breakfast, lunch, snack & dinner</p>
          </div>
        </div>
        <Switch
          checked={settings.mealReminders}
          onCheckedChange={(checked) => updateSettings({ mealReminders: checked })}
        />
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Reminders are scheduled between 8 AM and 10 PM
      </p>
    </motion.div>
  );
};
