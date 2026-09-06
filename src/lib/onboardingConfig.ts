import aboutYouArt from "@/assets/onboarding/about-you.jpg";
import foodCultureArt from "@/assets/onboarding/food-culture.jpg";
import foodPersonalityArt from "@/assets/onboarding/food-personality.jpg";
import goalArt from "@/assets/onboarding/goal.jpg";
import bodyActivityArt from "@/assets/onboarding/body-activity.jpg";
import routineArt from "@/assets/onboarding/routine.jpg";
import foodHabitsArt from "@/assets/onboarding/food-habits.jpg";
import eatingOutArt from "@/assets/onboarding/eating-out.jpg";
import proteinArt from "@/assets/onboarding/protein.jpg";
import nonNegotiablesArt from "@/assets/onboarding/non-negotiables.jpg";
import challengesArt from "@/assets/onboarding/challenges.jpg";
import supportArt from "@/assets/onboarding/support.jpg";

export type Option = { value: string; label: string; emoji?: string; desc?: string };

export type StepField =
  | { kind: "text"; key: string; label: string; placeholder?: string }
  | { kind: "number"; key: string; label: string; placeholder?: string; suffix?: string }
  | { kind: "time"; key: string; label: string }
  | { kind: "single"; key: string; label?: string; options: Option[]; columns?: 1 | 2 | 3 }
  | { kind: "multi"; key: string; label?: string; options: Option[]; max?: number; columns?: 1 | 2 | 3 }
  | { kind: "tags"; key: string; label: string; placeholder?: string }
  | { kind: "scale"; key: string; label: string; minLabel: string; maxLabel: string }
  | { kind: "toggle"; key: string; label: string; desc?: string };

export type OnboardingStep = {
  id: string;
  section: string;
  title: string;
  subtitle?: string;
  image: string;
  imageAlt: string;
  fields: StepField[];
  required?: string[];
};

export const FOOD_CULTURES: Option[] = [
  { value: "indian", label: "Indian", emoji: "🇮🇳" },
  { value: "pakistani", label: "Pakistani", emoji: "🇵🇰" },
  { value: "bangladeshi", label: "Bangladeshi", emoji: "🇧🇩" },
  { value: "sri_lankan", label: "Sri Lankan", emoji: "🇱🇰" },
  { value: "british", label: "British", emoji: "🇬🇧" },
  { value: "mediterranean", label: "Mediterranean", emoji: "🫒" },
  { value: "middle_eastern", label: "Middle Eastern", emoji: "🥙" },
  { value: "african", label: "African", emoji: "🌍" },
  { value: "east_asian", label: "East Asian", emoji: "🍜" },
  { value: "southeast_asian", label: "Southeast Asian", emoji: "🍛" },
  { value: "european", label: "European", emoji: "🥖" },
  { value: "other", label: "Other", emoji: "🍽️" },
];

/** Culture-aware comfort food suggestions shown in the Food Personality step. */
export const CULTURE_FOODS: Record<string, Option[]> = {
  indian: [
    { value: "idly_dosa", label: "Idly / Dosa", emoji: "🥞" },
    { value: "poha_upma", label: "Poha / Upma", emoji: "🍚" },
    { value: "paratha_roti", label: "Paratha / Roti", emoji: "🫓" },
    { value: "rice_meals", label: "Rice meals", emoji: "🍛" },
    { value: "south_indian", label: "South Indian meals", emoji: "🥥" },
    { value: "north_indian", label: "North Indian meals", emoji: "🍲" },
    { value: "indian_snacks", label: "Snacks & chaat", emoji: "🥟" },
  ],
  pakistani: [
    { value: "paratha_anda", label: "Paratha & anda", emoji: "🫓" },
    { value: "biryani", label: "Biryani / Pulao", emoji: "🍛" },
    { value: "nihari_haleem", label: "Nihari / Haleem", emoji: "🍲" },
    { value: "kebabs", label: "Kebabs & grills", emoji: "🍢" },
    { value: "daal_roti", label: "Daal & roti", emoji: "🥘" },
  ],
  bangladeshi: [
    { value: "rice_fish", label: "Rice & fish curry", emoji: "🐟" },
    { value: "khichuri", label: "Khichuri", emoji: "🍚" },
    { value: "bhorta", label: "Bhorta & vegetables", emoji: "🥬" },
    { value: "roti_dal", label: "Roti & dal", emoji: "🫓" },
  ],
  sri_lankan: [
    { value: "hoppers", label: "Hoppers", emoji: "🥞" },
    { value: "rice_curry", label: "Rice & curry", emoji: "🍛" },
    { value: "kottu", label: "Kottu", emoji: "🍳" },
    { value: "string_hoppers", label: "String hoppers", emoji: "🍜" },
  ],
  british: [
    { value: "porridge", label: "Porridge & oats", emoji: "🥣" },
    { value: "full_english", label: "Cooked breakfast", emoji: "🍳" },
    { value: "roast", label: "Roast dinner", emoji: "🍗" },
    { value: "sandwiches", label: "Sandwiches & wraps", emoji: "🥪" },
    { value: "jacket_potato", label: "Jacket potato", emoji: "🥔" },
  ],
  mediterranean: [
    { value: "salads", label: "Fresh salads", emoji: "🥗" },
    { value: "grilled_fish", label: "Grilled fish", emoji: "🐟" },
    { value: "pasta", label: "Pasta dishes", emoji: "🍝" },
    { value: "hummus", label: "Hummus & flatbread", emoji: "🫓" },
  ],
  middle_eastern: [
    { value: "shawarma", label: "Shawarma & grills", emoji: "🌯" },
    { value: "mezze", label: "Mezze plates", emoji: "🫓" },
    { value: "rice_lamb", label: "Rice & lamb", emoji: "🍖" },
    { value: "labneh", label: "Labneh & olives", emoji: "🫒" },
  ],
  african: [
    { value: "jollof", label: "Jollof rice", emoji: "🍚" },
    { value: "stews", label: "Slow-cooked stews", emoji: "🍲" },
    { value: "injera", label: "Injera & wat", emoji: "🫓" },
    { value: "grilled_meat", label: "Grilled meat", emoji: "🍖" },
  ],
  east_asian: [
    { value: "noodles", label: "Noodle bowls", emoji: "🍜" },
    { value: "rice_bowls", label: "Rice bowls", emoji: "🍚" },
    { value: "dumplings", label: "Dumplings", emoji: "🥟" },
    { value: "sushi", label: "Sushi & sashimi", emoji: "🍣" },
  ],
  southeast_asian: [
    { value: "nasi", label: "Nasi / rice plates", emoji: "🍛" },
    { value: "pho", label: "Pho & soups", emoji: "🍲" },
    { value: "stir_fry", label: "Stir fries", emoji: "🥘" },
    { value: "satay", label: "Satay & grills", emoji: "🍢" },
  ],
  european: [
    { value: "bread_cheese", label: "Bread & cheese", emoji: "🧀" },
    { value: "soups", label: "Soups", emoji: "🥣" },
    { value: "pasta_eu", label: "Pasta & risotto", emoji: "🍝" },
    { value: "potato_meat", label: "Potato & meat plates", emoji: "🥔" },
  ],
  other: [
    { value: "home_cooked", label: "Home-cooked meals", emoji: "🏠" },
    { value: "simple_plates", label: "Simple balanced plates", emoji: "🍽️" },
    { value: "street_food", label: "Street food", emoji: "🌮" },
  ],
};

export const NON_NEGOTIABLE_OPTIONS: Option[] = [
  { value: "Fruit", label: "Fruit", emoji: "🍎" },
  { value: "Vegetables", label: "Vegetables", emoji: "🥦" },
  { value: "Protein source", label: "Protein source", emoji: "🍗" },
  { value: "Milk", label: "Milk", emoji: "🥛" },
  { value: "Yogurt", label: "Yogurt", emoji: "🥣" },
  { value: "Eggs", label: "Eggs", emoji: "🥚" },
  { value: "Traditional breakfast", label: "Traditional breakfast", emoji: "🍲" },
  { value: "Nuts", label: "Nuts", emoji: "🥜" },
  { value: "Fish", label: "Fish", emoji: "🐟" },
  { value: "Leafy vegetables", label: "Leafy vegetables", emoji: "🥬" },
  { value: "Lentils", label: "Lentils", emoji: "🫘" },
  { value: "Home-cooked food", label: "Home-cooked food", emoji: "🏠" },
  { value: "Water goal", label: "Water goal", emoji: "💧" },
  { value: "Exercise", label: "Exercise", emoji: "🏃" },
  { value: "Family meals", label: "Family meals", emoji: "👨‍👩‍👧" },
];

export const FREQUENCY_OPTIONS: Option[] = [
  { value: "daily", label: "Daily" },
  { value: "5_per_week", label: "5 times a week" },
  { value: "3_per_week", label: "3 times a week" },
  { value: "weekly", label: "Once a week" },
];

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "about",
    section: "About you",
    title: "What should we call you?",
    subtitle: "A first name is perfect — this is how Nutrio will greet you.",
    image: aboutYouArt,
    imageAlt: "Illustration of a friendly person waving hello",
    required: ["display_name"],
    fields: [
      { kind: "text", key: "display_name", label: "Your name", placeholder: "e.g. Surya" },
      {
        kind: "single",
        key: "age_range",
        label: "Age range",
        columns: 3,
        options: [
          { value: "18-24", label: "18–24" },
          { value: "25-34", label: "25–34" },
          { value: "35-44", label: "35–44" },
          { value: "45-54", label: "45–54" },
          { value: "55-64", label: "55–64" },
          { value: "65+", label: "65+" },
        ],
      },
      {
        kind: "single",
        key: "gender",
        label: "Gender",
        columns: 2,
        options: [
          { value: "male", label: "Male", emoji: "👨" },
          { value: "female", label: "Female", emoji: "👩" },
          { value: "prefer_not_to_say", label: "Prefer not to say", emoji: "🤝" },
          { value: "custom", label: "Custom", emoji: "🧑" },
        ],
      },
    ],
  },
  {
    id: "culture",
    section: "About you",
    title: "Which food cultures feel like home?",
    subtitle: "Pick as many as you like — this shapes every suggestion Nutrio makes.",
    image: foodCultureArt,
    imageAlt: "Illustration of a globe surrounded by dishes from around the world",
    fields: [
      { kind: "text", key: "residence_country", label: "Where do you live now?", placeholder: "e.g. United Kingdom" },
      { kind: "multi", key: "food_cultures", label: "Food culture", options: FOOD_CULTURES, columns: 2 },
      {
        kind: "single",
        key: "cultural_food_frequency",
        label: "How often do you eat food from your culture?",
        columns: 2,
        options: [
          { value: "daily", label: "Daily" },
          { value: "few_times_week", label: "Few times a week" },
          { value: "occasionally", label: "Occasionally" },
          { value: "rarely", label: "Rarely" },
        ],
      },
    ],
  },
  {
    id: "personality",
    section: "Food personality",
    title: "What food feels like home to you?",
    subtitle: "Choose the meals you genuinely enjoy — Nutrio builds around them.",
    image: foodPersonalityArt,
    imageAlt: "Illustration of a heart-shaped plate filled with favourite foods",
    fields: [
      { kind: "multi", key: "comfort_foods", label: "I enjoy these most", options: [], max: 5, columns: 2 },
      { kind: "tags", key: "favourite_foods", label: "Your top 3 favourite foods", placeholder: "Type a food and press Enter" },
    ],
  },
  {
    id: "dislikes",
    section: "Food personality",
    title: "Anything you'd rather not see?",
    subtitle: "Tell us what to leave out and we'll never suggest it.",
    image: foodHabitsArt,
    imageAlt: "Illustration of a cooking pot with fresh vegetables",
    fields: [
      { kind: "tags", key: "disliked_foods", label: "Foods you dislike", placeholder: "e.g. mushrooms" },
      { kind: "tags", key: "avoided_foods", label: "Foods you avoid", placeholder: "e.g. pork, beef, alcohol" },
    ],
  },
  {
    id: "goal",
    section: "Your goal",
    title: "What's your main goal right now?",
    subtitle: "You can change this whenever life changes.",
    image: goalArt,
    imageAlt: "Illustration of a target with an arrow and a rising chart",
    required: ["primary_goal"],
    fields: [
      {
        kind: "single",
        key: "primary_goal",
        options: [
          { value: "lose_weight", label: "Lose weight", emoji: "📉" },
          { value: "maintain_weight", label: "Maintain weight", emoji: "⚖️" },
          { value: "gain_muscle", label: "Gain muscle", emoji: "💪" },
          { value: "eat_healthier", label: "Eat healthier", emoji: "🥗" },
          { value: "increase_protein", label: "Increase protein", emoji: "🍳" },
          { value: "improve_energy", label: "Improve energy", emoji: "⚡" },
          { value: "improve_routine", label: "Improve routine", emoji: "🗓️" },
        ],
        columns: 2,
      },
      {
        kind: "multi",
        key: "success_definition",
        label: "What would success look like?",
        columns: 2,
        options: [
          { value: "weight_target", label: "Hitting a weight target" },
          { value: "strength", label: "Feeling stronger" },
          { value: "energy", label: "More energy" },
          { value: "routine", label: "A better routine" },
          { value: "consistency", label: "Being consistent" },
        ],
      },
      { kind: "scale", key: "goal_importance", label: "How important is this right now?", minLabel: "Nice to have", maxLabel: "Top priority" },
    ],
  },
  {
    id: "body",
    section: "Body & activity",
    title: "A few numbers to set your targets",
    subtitle: "We use these to work out your daily calories and protein.",
    image: bodyActivityArt,
    imageAlt: "Illustration of a measuring tape, dumbbell and running shoe",
    required: ["height_cm", "weight_kg"],
    fields: [
      { kind: "number", key: "height_cm", label: "Height (cm)", placeholder: "175" },
      { kind: "number", key: "weight_kg", label: "Current weight (kg)", placeholder: "70" },
      { kind: "number", key: "goal_weight_kg", label: "Goal weight (kg) — optional", placeholder: "68" },
      {
        kind: "single",
        key: "activity_level",
        label: "Activity level",
        options: [
          { value: "sedentary", label: "Sedentary", desc: "Little or no exercise", emoji: "🛋️" },
          { value: "light", label: "Lightly active", desc: "1–3 workouts a week", emoji: "🚶" },
          { value: "moderate", label: "Moderately active", desc: "3–5 workouts a week", emoji: "🏃" },
          { value: "active", label: "Very active", desc: "6–7 workouts a week", emoji: "💪" },
          { value: "very_active", label: "Extremely active", desc: "Athlete or physical job", emoji: "🏆" },
        ],
      },
    ],
  },
  {
    id: "workout",
    section: "Body & activity",
    title: "How do you like to train?",
    subtitle: "Skip anything that doesn't apply.",
    image: bodyActivityArt,
    imageAlt: "Illustration of training equipment",
    fields: [
      {
        kind: "multi",
        key: "workout_types",
        label: "Workout type",
        columns: 2,
        options: [
          { value: "strength", label: "Strength", emoji: "🏋️" },
          { value: "cardio", label: "Cardio", emoji: "🏃" },
          { value: "hiit", label: "HIIT", emoji: "🔥" },
          { value: "yoga", label: "Yoga & mobility", emoji: "🧘" },
          { value: "walking", label: "Walking", emoji: "🚶" },
          { value: "sport", label: "Sport", emoji: "⚽" },
        ],
      },
      {
        kind: "single",
        key: "workout_frequency",
        label: "Days per week",
        columns: 3,
        options: [
          { value: "0", label: "None" },
          { value: "1-2", label: "1–2" },
          { value: "3-4", label: "3–4" },
          { value: "5-6", label: "5–6" },
          { value: "7", label: "Every day" },
        ],
      },
      { kind: "time", key: "workout_time", label: "What time do you usually work out?" },
    ],
  },
  {
    id: "routine",
    section: "Daily routine",
    title: "Walk us through a normal day",
    subtitle: "Reminders will follow your rhythm, not a generic timetable.",
    image: routineArt,
    imageAlt: "Illustration of a clock surrounded by meal icons, a sun and a moon",
    fields: [
      { kind: "time", key: "wake_time", label: "Wake up" },
      { kind: "time", key: "breakfast_time", label: "Breakfast" },
      { kind: "time", key: "lunch_time", label: "Lunch" },
      { kind: "time", key: "dinner_time", label: "Dinner" },
      { kind: "time", key: "sleep_time", label: "Sleep" },
      {
        kind: "multi",
        key: "meals_eaten",
        label: "Which meals do you usually eat?",
        columns: 2,
        options: [
          { value: "breakfast", label: "Breakfast", emoji: "🌅" },
          { value: "lunch", label: "Lunch", emoji: "☀️" },
          { value: "dinner", label: "Dinner", emoji: "🌙" },
          { value: "morning_snack", label: "Morning snack", emoji: "🍎" },
          { value: "evening_snack", label: "Evening snack", emoji: "🥜" },
          { value: "late_night_snack", label: "Late-night snack", emoji: "🌜" },
        ],
      },
      {
        kind: "single",
        key: "timing_variability",
        label: "Do your meal timings change often?",
        columns: 3,
        options: [
          { value: "no", label: "No" },
          { value: "sometimes", label: "Sometimes" },
          { value: "yes", label: "Often" },
        ],
      },
    ],
  },
  {
    id: "habits",
    section: "Food habits",
    title: "How does food usually happen?",
    subtitle: "This decides whether we suggest a 10-minute meal or a slow cook.",
    image: foodHabitsArt,
    imageAlt: "Illustration of a pot cooking on a hob with vegetables",
    fields: [
      {
        kind: "single",
        key: "cooking_frequency",
        label: "How often do you cook?",
        columns: 2,
        options: [
          { value: "daily", label: "Daily" },
          { value: "few_times_week", label: "Few times a week" },
          { value: "occasionally", label: "Occasionally" },
          { value: "rarely", label: "Rarely" },
        ],
      },
      {
        kind: "single",
        key: "cooking_time",
        label: "Time you have to prepare food",
        columns: 2,
        options: [
          { value: "under_10", label: "Under 10 min" },
          { value: "10_20", label: "10–20 min" },
          { value: "20_40", label: "20–40 min" },
          { value: "over_40", label: "More than 40 min" },
        ],
      },
    ],
  },
  {
    id: "eating_out",
    section: "Food habits",
    title: "Where do most of your meals happen?",
    image: eatingOutArt,
    imageAlt: "Illustration of a takeaway box beside a home dining table",
    fields: [
      {
        kind: "single",
        key: "eating_location",
        label: "Most meals are eaten",
        columns: 2,
        options: [
          { value: "home", label: "At home", emoji: "🏠" },
          { value: "work", label: "At work", emoji: "💼" },
          { value: "restaurant", label: "Restaurants", emoji: "🍴" },
          { value: "on_the_go", label: "On the go", emoji: "🚗" },
          { value: "combination", label: "A bit of everything", emoji: "🔀" },
        ],
      },
      {
        kind: "single",
        key: "eating_out_frequency",
        label: "How often do you eat out?",
        columns: 2,
        options: [
          { value: "rarely", label: "Rarely" },
          { value: "weekly", label: "Weekly" },
          { value: "several_week", label: "Several times a week" },
          { value: "daily", label: "Daily" },
        ],
      },
    ],
  },
  {
    id: "protein",
    section: "Protein & nutrition",
    title: "Where does your protein come from?",
    image: proteinArt,
    imageAlt: "Illustration of eggs, chicken, fish, lentils and yogurt",
    fields: [
      {
        kind: "multi",
        key: "protein_sources",
        columns: 2,
        options: [
          { value: "eggs", label: "Eggs", emoji: "🥚" },
          { value: "chicken", label: "Chicken", emoji: "🍗" },
          { value: "fish", label: "Fish", emoji: "🐟" },
          { value: "dairy", label: "Dairy", emoji: "🥛" },
          { value: "yogurt", label: "Yogurt", emoji: "🥣" },
          { value: "paneer", label: "Paneer", emoji: "🧀" },
          { value: "tofu", label: "Tofu", emoji: "🌱" },
          { value: "lentils", label: "Lentils", emoji: "🫘" },
          { value: "beans", label: "Beans", emoji: "🌰" },
          { value: "protein_powder", label: "Protein powder", emoji: "🥤" },
        ],
      },
      { kind: "scale", key: "protein_confidence", label: "How confident are you that you get enough protein?", minLabel: "Not at all", maxLabel: "Very confident" },
      { kind: "toggle", key: "wants_protein_help", label: "Help me increase protein", desc: "Nutrio will nudge protein-first suggestions." },
    ],
  },
  {
    id: "non_negotiables",
    section: "Non-negotiables",
    title: "What must stay in your routine?",
    subtitle: "Pick the habits you never want to lose, then set how often.",
    image: nonNegotiablesArt,
    imageAlt: "Illustration of a checklist with fruit, water and vegetables ticked off",
    fields: [
      { kind: "multi", key: "non_negotiables", options: NON_NEGOTIABLE_OPTIONS, columns: 2 },
    ],
  },
  {
    id: "challenges",
    section: "Challenges",
    title: "What makes eating well hard?",
    subtitle: "Knowing this lets Nutrio step in at the right moment.",
    image: challengesArt,
    imageAlt: "Illustration of a person calmly stepping over small hurdles",
    fields: [
      {
        kind: "multi",
        key: "challenges",
        columns: 2,
        options: [
          { value: "no_time", label: "No time", emoji: "⏳" },
          { value: "dont_know", label: "Don't know what to eat", emoji: "🤔" },
          { value: "cravings", label: "Cravings", emoji: "🍫" },
          { value: "eating_out", label: "Eating out", emoji: "🍴" },
          { value: "travel", label: "Travel", emoji: "✈️" },
          { value: "work", label: "Work schedule", emoji: "💼" },
          { value: "cooking", label: "Cooking", emoji: "🍳" },
          { value: "cost", label: "Cost", emoji: "💷" },
          { value: "family", label: "Family meals", emoji: "👨‍👩‍👧" },
          { value: "inconsistent", label: "Inconsistent routine", emoji: "🔁" },
        ],
      },
      {
        kind: "multi",
        key: "off_routine_times",
        label: "When are you most likely to go off routine?",
        columns: 2,
        options: [
          { value: "morning", label: "Morning" },
          { value: "afternoon", label: "Afternoon" },
          { value: "evening", label: "Evening" },
          { value: "weekend", label: "Weekends" },
          { value: "travel", label: "Travel" },
          { value: "social", label: "Social events" },
          { value: "stress", label: "Stressful days" },
        ],
      },
    ],
  },
  {
    id: "support",
    section: "How we support you",
    title: "How should Nutrio speak to you?",
    subtitle: "You can change this any time in settings.",
    image: supportArt,
    imageAlt: "Illustration of a phone showing a gentle reminder bell and sliders",
    fields: [
      {
        kind: "single",
        key: "support_style",
        label: "Support style",
        options: [
          { value: "gentle", label: "Gentle reminders", desc: "Light touch, only when it matters", emoji: "🌿" },
          { value: "regular", label: "Regular reminders", desc: "A steady, helpful rhythm", emoji: "🔔" },
          { value: "strong", label: "Strong accountability", desc: "Direct and holds you to it", emoji: "🎯" },
        ],
      },
      {
        kind: "single",
        key: "insight_frequency",
        label: "How often would you like insights?",
        columns: 3,
        options: [
          { value: "daily", label: "Daily" },
          { value: "few_times_week", label: "Few times a week" },
          { value: "weekly", label: "Weekly" },
        ],
      },
      { kind: "toggle", key: "notifications_enabled", label: "Personalised notifications", desc: "Meal, workout, hydration and weekly review reminders." },
    ],
  },
];
