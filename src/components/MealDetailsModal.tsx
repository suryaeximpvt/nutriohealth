import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Edit2, Plus, Sparkles, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface FoodLog {
  id: string;
  meal_type: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  quantity: number;
  unit: string;
}

interface MealDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: string;
  foods: FoodLog[];
  onDeleteFood: (id: string) => Promise<{ error: string | null }>;
  onEditFood: (id: string, quantity: number) => Promise<{ error: string | null }>;
  onAddFood: () => void;
  onGetAISuggestions: () => void;
}

export const MealDetailsModal = forwardRef<HTMLDivElement, MealDetailsModalProps>(({
  isOpen,
  onClose,
  mealType,
  foods,
  onDeleteFood,
  onEditFood,
  onAddFood,
  onGetAISuggestions,
}, ref) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0);
  const totalProtein = foods.reduce((sum, f) => sum + Number(f.protein), 0);
  const totalCarbs = foods.reduce((sum, f) => sum + Number(f.carbs), 0);
  const totalFat = foods.reduce((sum, f) => sum + Number(f.fat), 0);
  const totalFibre = foods.reduce((sum, f) => sum + Number(f.fibre), 0);

  const handleStartEdit = (food: FoodLog) => {
    setEditingId(food.id);
    setEditQuantity(food.quantity);
  };

  const handleSaveEdit = async (food: FoodLog) => {
    if (editQuantity === food.quantity) {
      setEditingId(null);
      return;
    }

    setSavingId(food.id);
    const { error } = await onEditFood(food.id, editQuantity);
    setSavingId(null);
    
    if (error) {
      toast.error("Failed to update food");
    } else {
      toast.success("Food updated");
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await onDeleteFood(id);
    setDeletingId(null);
    
    if (error) {
      toast.error("Failed to delete food");
    } else {
      toast.success("Food deleted");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card z-10 px-6 pt-4 pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">{mealType}</h2>
                <button
                  onClick={onClose}
                  aria-label="Close meal details"
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="w-12 h-1 bg-muted rounded-full mx-auto mt-3" />
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-80px)] px-6 py-4">
              {foods.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No foods logged for {mealType.toLowerCase()}</p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={onGetAISuggestions}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get AI Suggestions
                    </Button>
                    <Button onClick={onAddFood}>
                      <Plus className="w-4 h-4 mr-2" />
                      Log Food
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Totals Summary */}
                  <div className="bg-primary/10 rounded-xl p-4 mb-4">
                    <div className="grid grid-cols-5 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-foreground">{totalCalories}</p>
                        <p className="text-xs text-muted-foreground">kcal</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">{Math.round(totalProtein)}g</p>
                        <p className="text-xs text-muted-foreground">Protein</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">{Math.round(totalCarbs)}g</p>
                        <p className="text-xs text-muted-foreground">Carbs</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">{Math.round(totalFat)}g</p>
                        <p className="text-xs text-muted-foreground">Fat</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">{Math.round(totalFibre)}g</p>
                        <p className="text-xs text-muted-foreground">Fibre</p>
                      </div>
                    </div>
                  </div>

                  {/* Food List */}
                  <div className="space-y-3 mb-4">
                    {foods.map((food) => (
                      <motion.div
                        key={food.id}
                        layout
                        className="glass-card rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground">{food.food_name}</h3>
                            
                            {editingId === food.id ? (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm text-muted-foreground">Qty:</span>
                                <Input
                                  type="number"
                                  value={editQuantity}
                                  onChange={(e) => setEditQuantity(parseFloat(e.target.value) || 1)}
                                  className="w-20 h-8 text-sm"
                                  step={0.5}
                                  min={0.5}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSaveEdit(food)}
                                  disabled={savingId === food.id}
                                  className="h-8 px-2"
                                >
                                  {savingId === food.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4 text-primary" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingId(null)}
                                  className="h-8 px-2"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {food.quantity} serving{food.quantity !== 1 ? 's' : ''} • {food.calories} kcal
                              </p>
                            )}

                            {/* Macro breakdown */}
                            <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                              <span>P: {Math.round(Number(food.protein))}g</span>
                              <span>C: {Math.round(Number(food.carbs))}g</span>
                              <span>F: {Math.round(Number(food.fat))}g</span>
                              <span>Fi: {Math.round(Number(food.fibre))}g</span>
                            </div>
                          </div>

                          {editingId !== food.id && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleStartEdit(food)}
                                aria-label={`Edit ${food.food_name}`}
                                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(food.id)}
                                aria-label={`Delete ${food.food_name}`}
                                disabled={deletingId === food.id}
                                className="w-8 h-8 rounded-full hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                              >
                                {deletingId === food.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Add More Buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={onGetAISuggestions}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Suggestions
                    </Button>
                    <Button className="flex-1" onClick={onAddFood}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Food
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

MealDetailsModal.displayName = "MealDetailsModal";
