import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Upload, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RecognizedFood {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  confidence: number;
}

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: string;
  onFoodRecognized: (food: RecognizedFood) => void;
}

export const PhotoUploadModal = ({
  isOpen,
  onClose,
  mealType,
  onFoodRecognized,
}: PhotoUploadModalProps) => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<RecognizedFood | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        analyzeImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imageData: string) => {
    setAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-food-image", {
        body: { image: imageData, mealType },
      });

      if (error) throw error;

      if (data.food) {
        setResult(data.food);
      } else {
        toast.error("Couldn't recognize the food. Try a clearer photo.");
      }
    } catch (error: any) {
      console.error("Food analysis error:", error);
      toast.error("Failed to analyze image. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    if (result) {
      onFoodRecognized(result);
      handleClose();
    }
  };

  const handleClose = () => {
    setImage(null);
    setResult(null);
    setAnalyzing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
        onClick={handleClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-foreground text-lg">Scan Food</h2>
                <p className="text-muted-foreground text-sm capitalize">{mealType}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Upload Area */}
          {!image ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <p className="font-semibold text-foreground mb-1">Upload a photo</p>
              <p className="text-sm text-muted-foreground">Take a photo or choose from gallery</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative rounded-2xl overflow-hidden">
                <img src={image} alt="Food" className="w-full h-48 object-cover" />
                {analyzing && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Analyzing with AI...</p>
                  </div>
                )}
              </div>

              {/* Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/5 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">AI Recognition</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {Math.round(result.confidence * 100)}% confident
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-foreground text-lg mb-2">{result.name}</h3>
                  
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-card rounded-xl p-2">
                      <p className="font-bold text-foreground">{result.calories}</p>
                      <p className="text-xs text-muted-foreground">kcal</p>
                    </div>
                    <div className="bg-card rounded-xl p-2">
                      <p className="font-bold text-primary">{result.protein}g</p>
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div className="bg-card rounded-xl p-2">
                      <p className="font-bold text-nutrio-orange">{result.carbs}g</p>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                    </div>
                    <div className="bg-card rounded-xl p-2">
                      <p className="font-bold text-nutrio-amber">{result.fat}g</p>
                      <p className="text-xs text-muted-foreground">Fat</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setImage(null);
                    setResult(null);
                  }}
                  className="flex-1"
                >
                  Retake
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!result || analyzing}
                  className="flex-1"
                >
                  Add to {mealType}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
