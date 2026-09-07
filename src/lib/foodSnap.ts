export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type PortionSize = "small" | "medium" | "large";

export const MEAL_TYPES: { value: MealType; label: string; emoji: string }[] = [
  { value: "breakfast", label: "Breakfast", emoji: "🌅" },
  { value: "lunch", label: "Lunch", emoji: "☀️" },
  { value: "snack", label: "Snack", emoji: "🍎" },
  { value: "dinner", label: "Dinner", emoji: "🌙" },
];

export const PORTIONS: { value: PortionSize; label: string; factor: number }[] = [
  { value: "small", label: "Small", factor: 0.7 },
  { value: "medium", label: "Medium", factor: 1 },
  { value: "large", label: "Large", factor: 1.35 },
];

export const LOCATION_CONTEXTS = [
  { value: "home", label: "At home", emoji: "🏠" },
  { value: "work", label: "At work", emoji: "💼" },
  { value: "restaurant", label: "Eating out", emoji: "🍽" },
  { value: "travel", label: "Travelling", emoji: "✈️" },
  { value: "social", label: "Social event", emoji: "🎉" },
  { value: "other", label: "Somewhere else", emoji: "📍" },
];

export const DAY_CONTEXTS = [
  { value: "normal", label: "Normal day", emoji: "🙂" },
  { value: "busy", label: "Busy work day", emoji: "💼" },
  { value: "travel", label: "Travelling", emoji: "✈️" },
  { value: "social", label: "Social event", emoji: "🎉" },
  { value: "low_energy", label: "Low energy", emoji: "😴" },
  { value: "workout", label: "Workout day", emoji: "🏋️" },
  { value: "budget", label: "Budget focused", emoji: "💰" },
];

export const MISS_REASONS = [
  { value: "busy", label: "I was busy" },
  { value: "forgot", label: "I forgot" },
  { value: "social", label: "Social situation" },
  { value: "privacy", label: "Privacy" },
  { value: "no_phone", label: "Didn't want to use my phone" },
  { value: "other", label: "Other" },
];

export interface SnapItem {
  id: string;
  name: string;
  portion_size: PortionSize;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  origin: "ai" | "user";
  edited: boolean;
}

export interface SnapAnalysis {
  meal_type?: MealType;
  portion_size?: PortionSize;
  ingredients?: string[];
  items?: Partial<SnapItem>[];
  confidence?: number;
}

/** Meal type Nutrio expects at this hour — used as a starting guess only. */
export const guessMealType = (d = new Date()): MealType => {
  const h = d.getHours();
  if (h < 11) return "breakfast";
  if (h < 15) return "lunch";
  if (h < 18) return "snack";
  return "dinner";
};

export const num = (v: unknown, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, n) : fallback;
};
