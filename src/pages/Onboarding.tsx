import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, ChevronLeft, Target, User, Ruler, Activity, Utensils, AlertCircle, Loader2, TrendingDown, Dumbbell, Heart, Zap, Globe } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { toast } from "sonner";
import onboardingArt from "@/assets/onboarding-art.jpg";

type Goal = "fat_loss" | "muscle_gain" | "maintenance" | "endurance";
type Gender = "male" | "female" | "other";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
type DietPreference = "none" | "vegetarian" | "vegan";
type CuisinePreference = "global" | "indian" | "british" | "mediterranean" | "asian" | "american";

const STEPS = [
  { id: "goal", title: "What's your goal?", icon: Target },
  { id: "basic", title: "Tell us about yourself", icon: User },
  { id: "body", title: "Your measurements", icon: Ruler },
  { id: "activity", title: "Activity level", icon: Activity },
  { id: "diet", title: "Dietary preferences", icon: Utensils },
  { id: "cuisine", title: "Cuisine preference", icon: Globe },
  { id: "allergies", title: "Any allergies?", icon: AlertCircle },
];

const GOAL_OPTIONS = [
  { 
    value: "fat_loss" as Goal, 
    label: "Weight Loss", 
    desc: "Burn fat and get leaner",
    icon: TrendingDown,
    color: "from-red-500/20 to-orange-500/20",
    iconColor: "text-red-500"
  },
  { 
    value: "muscle_gain" as Goal, 
    label: "Muscle Gain", 
    desc: "Build strength and size",
    icon: Dumbbell,
    color: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-500"
  },
  { 
    value: "maintenance" as Goal, 
    label: "Maintenance", 
    desc: "Maintain current weight",
    icon: Heart,
    color: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-500"
  },
  { 
    value: "endurance" as Goal, 
    label: "Endurance / Fitness", 
    desc: "Improve stamina & performance",
    icon: Zap,
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500"
  },
];

const CUISINE_OPTIONS = [
  { value: "global" as CuisinePreference, label: "Global Mix", desc: "All cuisines welcome" },
  { value: "indian" as CuisinePreference, label: "Indian", desc: "Traditional Indian cuisine" },
  { value: "british" as CuisinePreference, label: "British", desc: "Classic British meals" },
  { value: "mediterranean" as CuisinePreference, label: "Mediterranean", desc: "Fresh, healthy options" },
  { value: "asian" as CuisinePreference, label: "Asian", desc: "Pan-Asian flavors" },
  { value: "american" as CuisinePreference, label: "American", desc: "American-style meals" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { updateProfile } = useUserData();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form state
  const [goal, setGoal] = useState<Goal | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [dietPreference, setDietPreference] = useState<DietPreference>("none");
  const [cuisinePreference, setCuisinePreference] = useState<CuisinePreference>("global");
  const [allergies, setAllergies] = useState("");

  const canProceed = () => {
    switch (step) {
      case 0: return goal !== null;
      case 1: return gender !== null && age !== "";
      case 2: return height !== "" && weight !== "";
      case 3: return activityLevel !== null;
      case 4: return true;
      case 5: return true;
      case 6: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const calculateTargets = () => {
    const w = parseFloat(weight) || 70;
    const h = parseFloat(height) || 170;
    const a = parseInt(age) || 30;
    
    // BMR calculation (Mifflin-St Jeor)
    let bmr = gender === "male"
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;

    // Activity multiplier
    const multipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    
    let tdee = bmr * (multipliers[activityLevel || "moderate"]);

    // Adjust for goal
    if (goal === "fat_loss") tdee -= 500;
    if (goal === "muscle_gain") tdee += 300;
    if (goal === "endurance") tdee += 200;

    const calorieTarget = Math.round(tdee);
    const proteinTarget = Math.round(w * (goal === "muscle_gain" ? 2 : goal === "endurance" ? 1.8 : 1.6));
    const fatTarget = Math.round((calorieTarget * 0.25) / 9);
    const carbsTarget = Math.round((calorieTarget - proteinTarget * 4 - fatTarget * 9) / 4);

    return { calorieTarget, proteinTarget, carbsTarget, fatTarget };
  };

  const handleComplete = async () => {
    setSaving(true);
    
    const targets = calculateTargets();
    const allergyList = allergies
      .split(",")
      .map(a => a.trim())
      .filter(a => a.length > 0);

    // Include cuisine preference in diet_preference field
    const fullDietPreference = cuisinePreference !== "global" 
      ? `${dietPreference}|${cuisinePreference}` 
      : dietPreference;

    const { error } = await updateProfile({
      goal: goal || "maintenance",
      gender: gender || undefined,
      age: parseInt(age) || undefined,
      height_cm: parseInt(height) || undefined,
      weight_kg: parseFloat(weight) || undefined,
      activity_level: activityLevel || "moderate",
      diet_preference: fullDietPreference,
      allergies: allergyList.length > 0 ? allergyList : null,
      calorie_target: targets.calorieTarget,
      protein_target: targets.proteinTarget,
      carbs_target: targets.carbsTarget,
      fat_target: targets.fatTarget,
    });

    setSaving(false);

    if (error) {
      toast.error("Failed to save profile");
      return;
    }

    toast.success("Profile saved! Let's start tracking.");
    navigate("/");
  };

  const StepIcon = STEPS[step].icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 container max-w-lg mx-auto px-4 py-8 flex flex-col">
        {/* Header */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <StepIcon className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{STEPS[step].title}</h1>
          <p className="text-muted-foreground mt-1">Step {step + 1} of {STEPS.length}</p>
        </motion.div>

        {/* Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Step 0: Goal Selection with Icon Cards */}
              {step === 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {GOAL_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = goal === option.value;
                    return (
                      <motion.button
                        key={option.value}
                        onClick={() => setGoal(option.value)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative p-6 rounded-2xl border-2 text-left transition-all overflow-hidden ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-lg"
                            : "border-border hover:border-primary/50 bg-card"
                        }`}
                      >
                        {/* Background gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-50`} />
                        
                        <div className="relative z-10">
                          {/* Icon */}
                          <div className={`w-14 h-14 rounded-2xl bg-background/80 flex items-center justify-center mb-4 ${isSelected ? 'shadow-md' : ''}`}>
                            <Icon className={`w-7 h-7 ${option.iconColor}`} />
                          </div>
                          
                          {/* Label */}
                          <p className="font-bold text-foreground text-lg mb-1">{option.label}</p>
                          <p className="text-sm text-muted-foreground leading-tight">{option.desc}</p>
                          
                          {/* Selected indicator */}
                          {isSelected && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                            >
                              <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Step 1: Gender & Age */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>Gender</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "male", label: "Male", icon: "👨" },
                        { value: "female", label: "Female", icon: "👩" },
                        { value: "other", label: "Other", icon: "🧑" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setGender(option.value as Gender)}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                            gender === option.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="text-2xl">{option.icon}</span>
                          <p className="font-medium text-foreground">{option.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="e.g. 30"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="text-lg"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Height & Weight */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="e.g. 175"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 70"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="text-lg"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Activity Level with Icons */}
              {step === 3 && (
                <div className="space-y-3">
                  {[
                    { value: "sedentary", label: "Sedentary", desc: "Little or no exercise", icon: "🛋️" },
                    { value: "light", label: "Lightly Active", desc: "1-3 workouts per week", icon: "🚶" },
                    { value: "moderate", label: "Moderately Active", desc: "3-5 workouts per week", icon: "🏃" },
                    { value: "active", label: "Very Active", desc: "6-7 workouts per week", icon: "💪" },
                    { value: "very_active", label: "Extremely Active", desc: "Athlete or physical job", icon: "🏆" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setActivityLevel(option.value as ActivityLevel)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                        activityLevel === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <p className="font-semibold text-foreground">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 4: Diet Preference */}
              {step === 4 && (
                <div className="space-y-3">
                  {[
                    { value: "none", label: "No Preference", desc: "I eat everything", icon: "🍽️" },
                    { value: "vegetarian", label: "Vegetarian", desc: "No meat or fish", icon: "🥗" },
                    { value: "vegan", label: "Vegan", desc: "No animal products", icon: "🌱" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDietPreference(option.value as DietPreference)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                        dietPreference === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <p className="font-semibold text-foreground">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 5: Cuisine Preference */}
              {step === 5 && (
                <div className="space-y-3">
                  <p className="text-muted-foreground mb-4">
                    Choose your preferred cuisine style for meal suggestions
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {CUISINE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setCuisinePreference(option.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          cuisinePreference === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <p className="font-semibold text-foreground">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6: Allergies */}
              {step === 6 && (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    List any foods you're allergic to or want to avoid (comma separated)
                  </p>
                  <Input
                    placeholder="e.g. nuts, shellfish, gluten"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave empty if you have no allergies or exclusions
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Decorative art fills the empty space */}
        <div className="mt-8 rounded-3xl bg-primary/5 border border-border overflow-hidden">
          <img
            src={onboardingArt}
            alt="Person preparing a healthy meal with fresh vegetables"
            width={1024}
            height={640}
            loading="lazy"
            className="w-full h-36 object-contain"
          />
        </div>

        {/* Navigation buttons */}
        <div className="sticky bottom-0 flex gap-3 mt-6 pt-4 border-t border-border bg-background">

          {step > 0 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed() || saving}
            className="flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : step === STEPS.length - 1 ? (
              "Complete"
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
