import { Capacitor, registerPlugin } from "@capacitor/core";

export interface AppleHealthSample {
  steps?: number;
  active_calories?: number;
  resting_heart_rate?: number;
  hrv_ms?: number;
  sleep_hours?: number;
}

interface HealthKitPlugin {
  requestAuthorization(options: { read: string[] }): Promise<{ granted?: boolean }>;
  queryToday(): Promise<AppleHealthSample>;
}

// Registered lazily. On iOS builds of the Nutrio app this resolves to the
// native HealthKit bridge; on the web it stays unavailable.
const HealthKit = registerPlugin<HealthKitPlugin>("HealthKit");

export const appleHealthAvailable = () =>
  Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("HealthKit");

export const readAppleHealthToday = async (): Promise<AppleHealthSample | null> => {
  if (!appleHealthAvailable()) return null;
  try {
    await HealthKit.requestAuthorization({
      read: ["steps", "activeEnergyBurned", "restingHeartRate", "heartRateVariability", "sleepAnalysis"],
    });
    return await HealthKit.queryToday();
  } catch {
    return null;
  }
};
