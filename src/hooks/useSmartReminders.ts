import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { usePersonalisation } from "./usePersonalisation";
import { useMealStatus } from "./useMealStatus";
import { useLifestyleMode } from "./useLifestyleMode";

export interface NotificationPreferences {
  enabled: boolean;
  intensity: string;
  meal_reminders: boolean;
  workout_reminders: boolean;
  hydration_reminders: boolean;
  non_negotiable_reminders: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  max_per_day: number;
}

export type Priority = "high" | "medium" | "low";

export interface SmartReminder {
  key: string;
  category: string;
  priority: Priority;
  title: string;
  body: string;
}

const iso = (d: Date) => d.toISOString().split("T")[0];

const toMinutes = (t?: string | null) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};

const inQuietHours = (prefs: NotificationPreferences | null) => {
  const start = toMinutes(prefs?.quiet_hours_start);
  const end = toMinutes(prefs?.quiet_hours_end);
  if (start === null || end === null) return false;
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  return start > end ? mins >= start || mins < end : mins >= start && mins < end;
};

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

interface Args {
  loggedCounts?: Record<string, number>;
  waterGlasses?: number;
}

export const useSmartReminders = ({ loggedCounts, waterGlasses = 0 }: Args = {}) => {
  const { user } = useAuth();
  const { routine } = usePersonalisation();
  const { statuses } = useMealStatus();
  const { activeMode } = useLifestyleMode();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [sentToday, setSentToday] = useState(0);
  const [reminders, setReminders] = useState<SmartReminder[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [prefRes, logRes] = await Promise.all([
      supabase.from("notification_preferences").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("notification_logs")
        .select("id")
        .eq("user_id", user.id)
        .gte("sent_at", todayStart.toISOString()),
    ]);
    setPrefs((prefRes.data as unknown as NotificationPreferences) ?? null);
    setSentToday((logRes.data ?? []).length);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user) return;

    // Respect the master switch and quiet hours
    if (prefs && (!prefs.enabled || inQuietHours(prefs))) {
      setReminders([]);
      return;
    }
    // Low energy mode pauses nudges entirely
    if (activeMode?.mode_key === "low_energy") {
      setReminders([]);
      return;
    }

    const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
    const out: SmartReminder[] = [];

    const mealDefs = [
      { key: "breakfast", label: "breakfast", time: routine?.breakfast_time, fallback: 9 * 60 },
      { key: "lunch", label: "lunch", time: routine?.lunch_time, fallback: 13 * 60 },
      { key: "dinner", label: "dinner", time: routine?.dinner_time, fallback: 19 * 60 + 30 },
    ];

    if (prefs?.meal_reminders !== false) {
      for (const m of mealDefs) {
        const due = toMinutes(m.time) ?? m.fallback;
        const logged = (loggedCounts?.[m.key] ?? 0) > 0;
        const responded = !!statuses[m.key];
        // Never nudge for something already logged or already answered
        if (logged || responded) continue;
        if (nowMins < due + 30) continue;
        out.push({
          key: `meal_${m.key}`,
          category: "meal",
          priority: "high",
          title: `Did you have ${m.label}?`,
          body: `Tap to tell Nutrio you ate, skipped it, or you're eating later.`,
        });
      }
    }

    if (prefs?.hydration_reminders !== false && waterGlasses < 8 && nowMins > 11 * 60) {
      out.push({
        key: "hydration",
        category: "hydration",
        priority: waterGlasses < 3 ? "medium" : "low",
        title: "Have you had water recently?",
        body: `You're on ${waterGlasses} of 8 glasses. A glass now keeps you steady.`,
      });
    }

    if (prefs?.workout_reminders !== false && nowMins > 18 * 60 && routine?.workout_time) {
      out.push({
        key: "workout",
        category: "workout",
        priority: "low",
        title: "How did training go?",
        body: "Log it, reschedule it, or mark today as a rest day.",
      });
    }

    const cap = prefs?.max_per_day ?? 6;
    const allowed = Math.max(0, cap - sentToday);
    out.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    setReminders(out.slice(0, allowed));
  }, [user, prefs, sentToday, routine, statuses, activeMode, loggedCounts, waterGlasses]);

  const acknowledge = async (reminder: SmartReminder, responded = true) => {
    if (!user) return;
    setReminders((r) => r.filter((x) => x.key !== reminder.key));
    await supabase.from("notification_logs").insert({
      user_id: user.id,
      category: reminder.category,
      priority: reminder.priority,
      title: reminder.title,
      body: reminder.body,
      responded,
    } as never);
    setSentToday((n) => n + 1);
  };

  return { reminders, prefs, sentToday, acknowledge, refresh: load };
};
