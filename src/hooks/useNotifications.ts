import { useEffect, useState, useCallback } from 'react';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

interface NotificationSettings {
  waterReminders: boolean;
  mealReminders: boolean;
  waterInterval: number; // hours
}

const DEFAULT_SETTINGS: NotificationSettings = {
  waterReminders: true,
  mealReminders: true,
  waterInterval: 2,
};

const STORAGE_KEY = 'nutrio_notification_settings';

export const useNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  // Load settings from storage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  // Request permissions on native platforms
  useEffect(() => {
    const requestPermission = async () => {
      if (!isNative) return;

      try {
        const result = await LocalNotifications.requestPermissions();
        setPermissionGranted(result.display === 'granted');
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
      }
    };

    requestPermission();
  }, [isNative]);

  // Schedule water reminders
  const scheduleWaterReminders = useCallback(async () => {
    if (!isNative || !permissionGranted || !settings.waterReminders) return;

    try {
      // Cancel existing water reminders
      const pending = await LocalNotifications.getPending();
      const waterIds = pending.notifications
        .filter(n => n.id >= 100 && n.id < 200)
        .map(n => ({ id: n.id }));
      
      if (waterIds.length > 0) {
        await LocalNotifications.cancel({ notifications: waterIds });
      }

      // Schedule new reminders every X hours from 8 AM to 10 PM
      const notifications: ScheduleOptions['notifications'] = [];
      const now = new Date();
      
      for (let hour = 8; hour <= 22; hour += settings.waterInterval) {
        const scheduleTime = new Date();
        scheduleTime.setHours(hour, 0, 0, 0);
        
        // If time has passed today, schedule for tomorrow
        if (scheduleTime <= now) {
          scheduleTime.setDate(scheduleTime.getDate() + 1);
        }

        notifications.push({
          id: 100 + hour,
          title: 'Time for water! 💧',
          body: getRandomWaterMessage(),
          schedule: {
            at: scheduleTime,
            repeats: true,
            every: 'day',
          },
          sound: 'default',
          actionTypeId: 'WATER_REMINDER',
        });
      }

      await LocalNotifications.schedule({ notifications });
      console.log('Water reminders scheduled:', notifications.length);
    } catch (error) {
      console.error('Error scheduling water reminders:', error);
    }
  }, [isNative, permissionGranted, settings.waterReminders, settings.waterInterval]);

  // Schedule meal reminders
  const scheduleMealReminders = useCallback(async () => {
    if (!isNative || !permissionGranted || !settings.mealReminders) return;

    try {
      // Cancel existing meal reminders
      const pending = await LocalNotifications.getPending();
      const mealIds = pending.notifications
        .filter(n => n.id >= 200 && n.id < 300)
        .map(n => ({ id: n.id }));
      
      if (mealIds.length > 0) {
        await LocalNotifications.cancel({ notifications: mealIds });
      }

      const mealTimes = [
        { id: 200, hour: 8, name: 'breakfast', emoji: '🌅' },
        { id: 201, hour: 12, name: 'lunch', emoji: '☀️' },
        { id: 202, hour: 16, name: 'snack', emoji: '🍎' },
        { id: 203, hour: 19, name: 'dinner', emoji: '🌙' },
      ];

      const notifications: ScheduleOptions['notifications'] = mealTimes.map(meal => {
        const scheduleTime = new Date();
        scheduleTime.setHours(meal.hour, 0, 0, 0);
        
        // If time has passed today, schedule for tomorrow
        if (scheduleTime <= new Date()) {
          scheduleTime.setDate(scheduleTime.getDate() + 1);
        }

        return {
          id: meal.id,
          title: `${meal.emoji} Time for ${meal.name}!`,
          body: getMealMessage(meal.name),
          schedule: {
            at: scheduleTime,
            repeats: true,
            every: 'day',
          },
          sound: 'default',
          actionTypeId: 'MEAL_REMINDER',
        };
      });

      await LocalNotifications.schedule({ notifications });
      console.log('Meal reminders scheduled:', notifications.length);
    } catch (error) {
      console.error('Error scheduling meal reminders:', error);
    }
  }, [isNative, permissionGranted, settings.mealReminders]);

  // Update settings and reschedule
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Reschedule notifications with new settings
    if (newSettings.waterReminders !== undefined || newSettings.waterInterval !== undefined) {
      await scheduleWaterReminders();
    }
    if (newSettings.mealReminders !== undefined) {
      await scheduleMealReminders();
    }
  }, [settings, scheduleWaterReminders, scheduleMealReminders]);

  // Initial scheduling when permission is granted
  useEffect(() => {
    if (permissionGranted) {
      scheduleWaterReminders();
      scheduleMealReminders();
    }
  }, [permissionGranted, scheduleWaterReminders, scheduleMealReminders]);

  // Listen for notification actions
  useEffect(() => {
    if (!isNative) return;

    const listener = LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('Notification action:', notification);
      // Handle notification tap - could navigate to specific screens
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [isNative]);

  return {
    settings,
    updateSettings,
    permissionGranted,
    isNative,
    scheduleWaterReminders,
    scheduleMealReminders,
  };
};

// Random water reminder messages
function getRandomWaterMessage(): string {
  const messages = [
    "Stay hydrated! Your body will thank you.",
    "Quick reminder: Have you had water recently?",
    "Hydration check! Grab a glass of water.",
    "Your body needs water to function at its best!",
    "Keep sipping! You're doing great.",
    "Water break time! Stay refreshed.",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Meal-specific messages
function getMealMessage(meal: string): string {
  const messages: Record<string, string[]> = {
    breakfast: [
      "Start your day right with a nutritious breakfast!",
      "Fuel up for the day ahead.",
      "Don't skip the most important meal!",
    ],
    lunch: [
      "Time to refuel! Log your lunch.",
      "Keep your energy up with a balanced lunch.",
      "Midday nutrition matters!",
    ],
    snack: [
      "Healthy snack time! Keep your energy steady.",
      "A smart snack keeps you going.",
      "Time for a nutritious pick-me-up!",
    ],
    dinner: [
      "End your day with a balanced dinner.",
      "Time for your evening meal!",
      "Log your dinner to complete your day.",
    ],
  };
  const options = messages[meal] || ["Time to eat!"];
  return options[Math.floor(Math.random() * options.length)];
}
