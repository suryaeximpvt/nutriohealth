import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Camera, Barcode, Mic, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
}

interface FoodLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: string;
  onLogFood: (food: FoodItem & { quantity: number }) => void;
}

// Common UK foods database (simplified)
const FOOD_DATABASE: FoodItem[] = [
  { name: "Porridge with milk", calories: 180, protein: 6, carbs: 27, fat: 5, fibre: 3 },
  { name: "Scrambled eggs (2 eggs)", calories: 180, protein: 13, carbs: 2, fat: 13, fibre: 0 },
  { name: "Wholemeal toast with butter", calories: 150, protein: 4, carbs: 20, fat: 6, fibre: 3 },
  { name: "Greek yogurt (150g)", calories: 130, protein: 15, carbs: 6, fat: 5, fibre: 0 },
  { name: "Banana", calories: 90, protein: 1, carbs: 23, fat: 0, fibre: 3 },
  { name: "Apple", calories: 80, protein: 0, carbs: 21, fat: 0, fibre: 4 },
  { name: "Chicken breast (150g)", calories: 240, protein: 45, carbs: 0, fat: 5, fibre: 0 },
  { name: "Salmon fillet (125g)", calories: 280, protein: 28, carbs: 0, fat: 18, fibre: 0 },
  { name: "Brown rice (150g cooked)", calories: 170, protein: 4, carbs: 36, fat: 1, fibre: 2 },
  { name: "Jacket potato", calories: 160, protein: 4, carbs: 36, fat: 0, fibre: 4 },
  { name: "Mixed salad", calories: 25, protein: 1, carbs: 4, fat: 0, fibre: 2 },
  { name: "Tuna sandwich", calories: 350, protein: 25, carbs: 35, fat: 12, fibre: 3 },
  { name: "Chicken wrap", calories: 420, protein: 28, carbs: 42, fat: 16, fibre: 3 },
  { name: "Soup (tomato, 250ml)", calories: 120, protein: 2, carbs: 18, fat: 4, fibre: 2 },
  { name: "Handful of almonds (30g)", calories: 180, protein: 6, carbs: 6, fat: 16, fibre: 4 },
  { name: "Crisps (25g bag)", calories: 130, protein: 2, carbs: 13, fat: 8, fibre: 1 },
  { name: "Chocolate bar (45g)", calories: 240, protein: 3, carbs: 26, fat: 14, fibre: 1 },
  { name: "Orange juice (200ml)", calories: 90, protein: 1, carbs: 20, fat: 0, fibre: 0 },
  { name: "Latte (medium)", calories: 150, protein: 8, carbs: 15, fat: 6, fibre: 0 },
  { name: "Cappuccino (medium)", calories: 120, protein: 6, carbs: 10, fat: 6, fibre: 0 },
];

export const FoodLogModal = ({
  isOpen,
  onClose,
  mealType,
  onLogFood,
}: FoodLogModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<"barcode" | "photo" | null>(null);

  const filteredFoods = FOOD_DATABASE.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleScan = async (mode: "barcode" | "photo") => {
    setScanMode(mode);
    setIsScanning(true);
    
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      stream.getTracks().forEach(track => track.stop());
      
      // Simulate scanning delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (mode === "barcode") {
        // Simulated barcode result
        toast.info("Barcode scanning is in beta. Manual search recommended for now.");
        setSearchQuery("Wholemeal toast");
      } else {
        // Simulated photo recognition
        toast.info("Photo recognition is in beta. Manual search recommended for now.");
        setSearchQuery("Chicken");
      }
    } catch (error) {
      console.error("Camera error:", error);
      toast.error("Camera access denied. Please enable camera permissions.");
    } finally {
      setIsScanning(false);
      setScanMode(null);
    }
  };

  const handleLogFood = () => {
    if (!selectedFood) return;
    
    onLogFood({
      ...selectedFood,
      quantity,
    });
    
    toast.success(`Added ${selectedFood.name} to ${mealType}`);
    setSelectedFood(null);
    setQuantity(1);
    setSearchQuery("");
    onClose();
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice input not supported in this browser");
      return;
    }
    
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      toast.success(`Heard: "${transcript}"`);
    };
    
    recognition.onerror = () => {
      toast.error("Couldn't understand. Please try again.");
    };
    
    recognition.start();
    toast.info("Listening... say a food name");
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
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card z-10 px-6 pt-4 pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Log {mealType}
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="w-12 h-1 bg-muted rounded-full mx-auto mt-3" />
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-80px)] px-6 py-4">
              {/* Quick Actions */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleScan("barcode")}
                  disabled={isScanning}
                >
                  {scanMode === "barcode" && isScanning ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Barcode className="w-4 h-4 mr-2" />
                  )}
                  Barcode
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleScan("photo")}
                  disabled={isScanning}
                >
                  {scanMode === "photo" && isScanning ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 mr-2" />
                  )}
                  Photo
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleVoiceInput}
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search foods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Selected Food Details */}
              {selectedFood && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-nutrio-sage-light rounded-xl p-4 mb-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{selectedFood.name}</h3>
                    <button
                      onClick={() => setSelectedFood(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <label className="text-sm text-muted-foreground">Servings:</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                      >
                        -
                      </Button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(quantity + 0.5)}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2 text-center text-sm mb-4">
                    <div>
                      <p className="font-bold text-foreground">{Math.round(selectedFood.calories * quantity)}</p>
                      <p className="text-xs text-muted-foreground">kcal</p>
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{Math.round(selectedFood.protein * quantity)}g</p>
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{Math.round(selectedFood.carbs * quantity)}g</p>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{Math.round(selectedFood.fat * quantity)}g</p>
                      <p className="text-xs text-muted-foreground">Fat</p>
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{Math.round(selectedFood.fibre * quantity)}g</p>
                      <p className="text-xs text-muted-foreground">Fibre</p>
                    </div>
                  </div>

                  <Button onClick={handleLogFood} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add to {mealType}
                  </Button>
                </motion.div>
              )}

              {/* Food List */}
              <div className="space-y-2">
                {filteredFoods.map((food) => (
                  <button
                    key={food.name}
                    onClick={() => setSelectedFood(food)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedFood?.name === food.name
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{food.name}</span>
                      <span className="text-sm text-muted-foreground">{food.calories} kcal</span>
                    </div>
                  </button>
                ))}
                
                {filteredFoods.length === 0 && searchQuery && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No foods found for "{searchQuery}"</p>
                    <p className="text-sm mt-1">Try a different search term</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};