import type { MealType } from "./foodSnap";

/** How a meal reached Nutrio. Ordered by how much detail it gives. */
export type CaptureMethod = "quick_confirm" | "voice" | "text" | "recap" | "photo";

export const CAPTURE_METHODS: {
  value: CaptureMethod;
  label: string;
  short: string;
  emoji: string;
}[] = [
  { value: "quick_confirm", label: "Just confirm", short: "Confirm", emoji: "✅" },
  { value: "voice", label: "Tell Nutrio", short: "Tell", emoji: "🎙" },
  { value: "text", label: "Type what I ate", short: "Type", emoji: "⌨️" },
  { value: "recap", label: "Daily recap", short: "Recap", emoji: "📝" },
  { value: "photo", label: "Upload a photo", short: "Photo", emoji: "📸" },
];

export const TRACKING_FRICTION_REASONS = [
  { value: "busy", label: "I was busy" },
  { value: "forgot", label: "I forgot" },
  { value: "eating_out", label: "I was eating out" },
  { value: "travelling", label: "I was travelling" },
  { value: "photo_inconvenient", label: "Taking photos is inconvenient" },
  { value: "didnt_want", label: "I didn't want to track" },
  { value: "other", label: "Other" },
];

export const ASK_LOCATIONS = [
  { value: "home", label: "At home", emoji: "🏠" },
  { value: "restaurant", label: "Restaurant", emoji: "🍽" },
  { value: "supermarket", label: "Supermarket", emoji: "🛒" },
  { value: "office", label: "Office", emoji: "💼" },
  { value: "travelling", label: "Travelling", emoji: "✈️" },
  { value: "social", label: "Social event", emoji: "🎉" },
];

export const ASK_INTENTS = [
  { value: "eat", label: "What should I eat?" },
  { value: "avoid", label: "What should I avoid?" },
  { value: "choose", label: "Help me choose" },
  { value: "alternative", label: "Suggest an alternative" },
];

export interface ParsedMeal {
  meal_type?: MealType;
  portion_size?: "small" | "medium" | "large";
  summary?: string;
  confidence?: number;
  estimated?: boolean;
  items?: {
    name: string;
    portion_size?: "small" | "medium" | "large";
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fibre?: number;
  }[];
}

export const isoDate = (d = new Date()) => d.toISOString().split("T")[0];
