import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Plus, Camera, Loader2, Sparkles, PenLine, ChevronDown, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { MealOptions, AISuggestion } from "@/hooks/useDailyAISuggestions";
import { useRecommendationTracking, type TrackPayload } from "@/hooks/useRecommendationTracking";
import { RecommendationFeedback } from "@/components/RecommendationFeedback";

interface AISuggestedMealCardProps {
  title: string;
  mealType: "breakfast" | "lunch" | "snacks" | "dinner";
  emoji: string;
  mealOptions: MealOptions | null;
  isLoading: boolean;
  loggedFoods: { id: string; food_name: string; calories: number; protein: number }[];
  onLogMeal: (suggestion: AISuggestion) => void;
  onRegenerate: () => void;
  onAddPhoto: () => void;
  onAddManual?: () => void;
  onDeleteFood: (id: string) => void;
  delay?: number;
}

export const AISuggestedMealCard = ({
  title,
  mealType,
  emoji,
  mealOptions,
  isLoading,
  loggedFoods,
  onLogMeal,
  onRegenerate,
  onAddPhoto,
  onAddManual,
  onDeleteFood,
  delay = 0,
}: AISuggestedMealCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedOption, setSelectedOption] = useState<AISuggestion | null>(null);
  const [ratedSuggestion, setRatedSuggestion] = useState<AISuggestion | null>(null);
  const { track, trackShown, submitFeedback } = useRecommendationTracking();

  const payloadFor = (s: AISuggestion): TrackPayload => ({
    recommendationType: "meal",
    mealType,
    content: { name: s.name, calories: s.calories },
  });
  
  const totalLogged = loggedFoods.reduce((sum, f) => sum + f.calories, 0);
  const hasLogged = loggedFoods.length > 0;

  // Use primary suggestion or selected option
  const currentSuggestion = selectedOption || mealOptions?.primary || null;

  // Calculate display calories - logged or suggested
  const displayCalories = hasLogged ? totalLogged : (currentSuggestion?.calories || 0);

  const handleSelectOption = (option: AISuggestion) => {
    setSelectedOption(option);
    void track("opened", payloadFor(option));
  };

  const handleLog = (s: AISuggestion) => {
    void track("accepted", payloadFor(s));
    void track("followed", payloadFor(s));
    setRatedSuggestion(s);
    onLogMeal(s);
  };

  const handleRegenerate = () => {
    if (currentSuggestion) void track("not_followed", payloadFor(currentSuggestion));
    onRegenerate();
  };

  useEffect(() => {
    if (isExpanded && currentSuggestion) trackShown(payloadFor(currentSuggestion));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded, currentSuggestion?.name]);

return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-2xl shadow-card overflow-hidden"
    >
      {/* Collapsed Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-3 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {currentSuggestion && (
              <>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-xs font-medium text-primary">AI Pick</span>
                </div>
                <span className="text-muted-foreground">•</span>
              </>
            )}
            <span className="text-xs text-muted-foreground">
              {hasLogged 
                ? `${displayCalories} kcal logged` 
                : currentSuggestion 
                  ? `${displayCalories} kcal suggested`
                  : "Tap to see suggestions"
              }
            </span>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/50">
              {/* Logged Foods */}
              {hasLogged && (
                <div className="px-4 pt-3 space-y-2">
                  {loggedFoods.map((food) => (
                    <div
                      key={food.id}
                      className="flex items-center justify-between py-2 px-3 bg-primary/5 rounded-xl"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{food.food_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {food.calories} kcal • {Math.round(food.protein)}g protein
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteFood(food.id);
                        }}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Suggestion */}
              <div className="p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">
                      Nutrio AI is thinking...
                    </span>
                  </div>
                ) : currentSuggestion ? (
                  <div className="space-y-4">
                    {/* Primary Suggestion Card */}
                    <SuggestionCard
                      suggestion={currentSuggestion}
                      isSelected={true}
                      onSelect={() => {}}
                      onLog={() => handleLog(currentSuggestion)}
                    />

                    {/* Other AI Options */}
                    {mealOptions?.alternatives && mealOptions.alternatives.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Other AI Options
                        </p>
                        <div className="space-y-2">
                          {mealOptions.alternatives.map((alt, idx) => (
                            <SuggestionCard
                              key={idx}
                              suggestion={alt}
                              isSelected={selectedOption?.name === alt.name}
                              isCompact
                              onSelect={() => handleSelectOption(alt)}
                              onLog={() => handleLog(alt)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {ratedSuggestion && (
                      <RecommendationFeedback
                        compact
                        payload={payloadFor(ratedSuggestion)}
                        onRate={(rating, reason) =>
                          submitFeedback(payloadFor(ratedSuggestion), rating, reason ?? null)
                        }
                      />
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLog(currentSuggestion);
                        }}
                        className="flex flex-col items-center justify-center gap-1 px-2 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-xs">Log</span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegenerate();
                        }}
                        disabled={isLoading}
                        className="flex flex-col items-center justify-center gap-1 px-2 py-3 bg-muted rounded-xl font-medium hover:bg-muted/80 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                        <span className="text-xs">New</span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddPhoto();
                        }}
                        className="flex flex-col items-center justify-center gap-1 px-2 py-3 bg-nutrio-blue/10 text-nutrio-blue rounded-xl font-medium hover:bg-nutrio-blue/20 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                        <span className="text-xs">Scan</span>
                      </button>

                      {onAddManual && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddManual();
                          }}
                          className="flex flex-col items-center justify-center gap-1 px-2 py-3 bg-nutrio-purple/10 text-nutrio-purple rounded-xl font-medium hover:bg-nutrio-purple/20 transition-colors"
                        >
                          <PenLine className="w-4 h-4" />
                          <span className="text-xs">Manual</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Sparkles className="w-8 h-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Tap to get AI suggestions
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegenerate();
                        }}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        Generate
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddPhoto();
                        }}
                        className="px-4 py-2 bg-nutrio-blue/10 text-nutrio-blue rounded-xl text-sm font-medium hover:bg-nutrio-blue/20 transition-colors"
                      >
                        Scan
                      </button>
                      {onAddManual && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddManual();
                          }}
                          className="px-4 py-2 bg-muted rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors"
                        >
                          Manual
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Individual suggestion card component
const SuggestionCard = ({
  suggestion,
  isSelected,
  isCompact = false,
  onSelect,
  onLog,
}: {
  suggestion: AISuggestion;
  isSelected: boolean;
  isCompact?: boolean;
  onSelect: () => void;
  onLog: () => void;
}) => {
  const hasNutrio = !!suggestion.nutrioProduct;

  if (isCompact) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={cn(
          "w-full text-left p-3 rounded-xl border transition-all",
          isSelected
            ? "border-primary bg-primary/5"
            : "border-border/50 hover:border-primary/50 hover:bg-muted/30",
          hasNutrio && "border-nutrio-amber/50"
        )}
      >
        <div className="flex items-start gap-2">
          <span className="text-lg">{suggestion.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground text-sm truncate">{suggestion.name}</p>
              {hasNutrio && (
                <span className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 bg-nutrio-amber/10 rounded text-nutrio-amber text-[10px] font-medium">
                  <Package className="w-2.5 h-2.5" />
                  Nutrio
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{suggestion.calories} kcal</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{suggestion.protein}g protein</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLog();
            }}
            className="flex-shrink-0 px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors"
          >
            Log
          </button>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{suggestion.emoji}</span>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">{suggestion.name}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {suggestion.description}
          </p>
          
          {/* Nutrio Product Badge */}
          {hasNutrio && (
            <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-nutrio-amber/10 rounded-lg border border-nutrio-amber/30">
              <Package className="w-4 h-4 text-nutrio-amber" />
              <span className="text-xs font-medium text-nutrio-amber">
                AI alternative using: {suggestion.nutrioProduct}
              </span>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="px-2 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary">
              {suggestion.calories} kcal
            </span>
            <span className="px-2 py-1 bg-nutrio-blue/10 rounded-full text-xs font-medium text-nutrio-blue">
              {suggestion.protein}g protein
            </span>
            <span className="px-2 py-1 bg-nutrio-amber/10 rounded-full text-xs font-medium text-nutrio-amber">
              {suggestion.prepTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
