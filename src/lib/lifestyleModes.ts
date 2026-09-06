export interface LifestyleModeQuestion {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface LifestyleModeDef {
  key: string;
  title: string;
  emoji: string;
  tagline: string;
  adaptations: string[];
  questions: LifestyleModeQuestion[];
}

export const DURATION_OPTIONS = [
  { value: "today", label: "Today", days: 0 },
  { value: "tomorrow", label: "Tomorrow", days: 1 },
  { value: "weekend", label: "This weekend", days: 2 },
  { value: "3_days", label: "3 days", days: 2 },
  { value: "1_week", label: "1 week", days: 6 },
  { value: "custom", label: "Custom dates", days: 0 },
];

export const LIFESTYLE_MODES: LifestyleModeDef[] = [
  {
    key: "travelling",
    title: "Travelling",
    emoji: "✈️",
    tagline: "Away from your usual kitchen",
    adaptations: [
      "Flexible meal timings",
      "Airport, hotel and on-the-go options",
      "Extra hydration reminders",
    ],
    questions: [
      {
        key: "travel_type",
        label: "What kind of trip is it?",
        options: [
          { value: "work", label: "Work trip" },
          { value: "holiday", label: "Holiday" },
          { value: "family", label: "Family visit" },
        ],
      },
      {
        key: "food_access",
        label: "What food access will you have?",
        options: [
          { value: "kitchen", label: "Kitchen available" },
          { value: "hotel", label: "Hotel / eating out" },
          { value: "limited", label: "Limited choices" },
        ],
      },
    ],
  },
  {
    key: "busy_work",
    title: "Busy Work",
    emoji: "💼",
    tagline: "Long days, little time",
    adaptations: ["Quick 10-minute meals", "Fewer notifications", "Protein-first reminders"],
    questions: [
      {
        key: "prep_time",
        label: "How much time do you have to prepare food?",
        options: [
          { value: "none", label: "Almost none" },
          { value: "10_min", label: "About 10 minutes" },
          { value: "30_min", label: "Around 30 minutes" },
        ],
      },
    ],
  },
  {
    key: "social",
    title: "Social / Celebration",
    emoji: "🎉",
    tagline: "Eating out, parties, occasions",
    adaptations: ["Extra calorie flexibility", "Portion guidance", "No guilt messaging"],
    questions: [
      {
        key: "event_type",
        label: "What's coming up?",
        options: [
          { value: "dinner", label: "Dinner out" },
          { value: "party", label: "Party or event" },
          { value: "wedding", label: "Wedding / festival" },
        ],
      },
    ],
  },
  {
    key: "workout_focus",
    title: "Workout Focus",
    emoji: "🏋️",
    tagline: "Training is the priority",
    adaptations: ["Higher protein targets", "Pre and post workout meals", "Recovery hydration"],
    questions: [
      {
        key: "sessions",
        label: "How many sessions this period?",
        options: [
          { value: "2_3", label: "2-3" },
          { value: "4_5", label: "4-5" },
          { value: "6_plus", label: "6+" },
        ],
      },
    ],
  },
  {
    key: "reset",
    title: "Reset Routine",
    emoji: "🔄",
    tagline: "Getting back on track gently",
    adaptations: ["Simple repeatable meals", "Consistency over perfection", "Daily check-ins"],
    questions: [
      {
        key: "reset_focus",
        label: "What do you want to rebuild first?",
        options: [
          { value: "meals", label: "Regular meals" },
          { value: "protein", label: "Protein" },
          { value: "hydration", label: "Hydration" },
        ],
      },
    ],
  },
  {
    key: "low_energy",
    title: "Sick / Low Energy",
    emoji: "🤒",
    tagline: "Rest and recover",
    adaptations: ["Gentle, easy foods", "Reminders paused", "Hydration first"],
    questions: [
      {
        key: "appetite",
        label: "How is your appetite?",
        options: [
          { value: "low", label: "Very low" },
          { value: "normal", label: "Fairly normal" },
        ],
      },
    ],
  },
  {
    key: "fasting",
    title: "Ramadan / Fasting",
    emoji: "🌙",
    tagline: "Eating within a window",
    adaptations: ["Suhoor and iftar timings", "Hydration between meals", "Balanced breaking meals"],
    questions: [
      {
        key: "fast_window",
        label: "When do you eat?",
        options: [
          { value: "suhoor_iftar", label: "Suhoor & iftar" },
          { value: "evening", label: "Evening only" },
          { value: "8_hour", label: "8-hour window" },
        ],
      },
    ],
  },
  {
    key: "home_routine",
    title: "Home Routine",
    emoji: "🏠",
    tagline: "Cooking at home, steady days",
    adaptations: ["Home-cooked suggestions", "Batch cooking ideas", "Normal reminder rhythm"],
    questions: [
      {
        key: "cooking_for",
        label: "Who are you cooking for?",
        options: [
          { value: "self", label: "Just me" },
          { value: "family", label: "The family" },
        ],
      },
    ],
  },
  {
    key: "eating_out",
    title: "Eating Out",
    emoji: "🍽️",
    tagline: "Restaurants and takeaways",
    adaptations: ["Menu-friendly choices", "Portion guidance", "Balance across the day"],
    questions: [
      {
        key: "frequency",
        label: "How often this period?",
        options: [
          { value: "once", label: "Once" },
          { value: "few", label: "A few times" },
          { value: "most_days", label: "Most days" },
        ],
      },
    ],
  },
];

export const getModeDef = (key?: string | null) =>
  LIFESTYLE_MODES.find((m) => m.key === key);
