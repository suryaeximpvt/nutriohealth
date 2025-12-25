import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Image, Upload, Loader2, Sparkles, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedFood, setEditedFood] = useState<RecognizedFood | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be less than 10MB");
        return;
      }

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
    setIsEditing(false);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-food-image", {
        body: { image: imageData, mealType },
      });

      if (error) throw error;

      if (data.food) {
        setResult(data.food);
        setEditedFood(data.food);
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
    if (isEditing && editedFood) {
      onFoodRecognized(editedFood);
    } else if (result) {
      onFoodRecognized(result);
    }
    handleClose();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editedFood) {
      setResult(editedFood);
      setIsEditing(false);
    }
  };

  const handleClose = () => {
    setImage(null);
    setResult(null);
    setAnalyzing(false);
    setIsEditing(false);
    setEditedFood(null);
    onClose();
  };

  const updateEditedFood = (field: keyof RecognizedFood, value: string | number) => {
    if (editedFood) {
      setEditedFood({
        ...editedFood,
        [field]: typeof value === 'string' && field !== 'name' ? Number(value) || 0 : value,
      });
    }
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

          {/* Upload Options */}
          {!image ? (
            <div className="space-y-4">
              {/* Camera Option */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full border-2 border-dashed border-primary/50 rounded-2xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-7 h-7 text-primary" />
                </div>
                <p className="font-semibold text-foreground mb-1">Take a Photo</p>
                <p className="text-sm text-muted-foreground">Use your camera to capture food</p>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </button>

              {/* Gallery Option */}
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="w-full border-2 border-dashed border-nutrio-blue/50 rounded-2xl p-6 text-center cursor-pointer hover:border-nutrio-blue hover:bg-nutrio-blue/5 transition-colors"
              >
                <div className="w-14 h-14 bg-nutrio-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Image className="w-7 h-7 text-nutrio-blue" />
                </div>
                <p className="font-semibold text-foreground mb-1">Choose from Gallery</p>
                <p className="text-sm text-muted-foreground">Select food images from your photos</p>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </button>

              <p className="text-xs text-center text-muted-foreground">
                AI will automatically detect the food and calculate nutrition
              </p>
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

              {/* Result - View Mode */}
              {result && !isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/5 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-foreground">AI Recognition</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {Math.round(result.confidence * 100)}% confident
                      </span>
                      <button
                        onClick={handleEdit}
                        className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                        title="Edit food details"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
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

                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Not right? Tap the edit icon to correct
                  </p>
                </motion.div>
              )}

              {/* Result - Edit Mode */}
              {result && isEditing && editedFood && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-nutrio-purple/5 rounded-2xl p-4 border border-nutrio-purple/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Edit2 className="w-5 h-5 text-nutrio-purple" />
                      <span className="font-semibold text-foreground">Edit Food Details</span>
                    </div>
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-nutrio-purple text-white text-sm font-medium hover:bg-nutrio-purple/90 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="food-name" className="text-xs text-muted-foreground">Food Name</Label>
                      <Input
                        id="food-name"
                        value={editedFood.name}
                        onChange={(e) => updateEditedFood('name', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="calories" className="text-xs text-muted-foreground">Calories (kcal)</Label>
                        <Input
                          id="calories"
                          type="number"
                          value={editedFood.calories}
                          onChange={(e) => updateEditedFood('calories', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="protein" className="text-xs text-muted-foreground">Protein (g)</Label>
                        <Input
                          id="protein"
                          type="number"
                          value={editedFood.protein}
                          onChange={(e) => updateEditedFood('protein', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="carbs" className="text-xs text-muted-foreground">Carbs (g)</Label>
                        <Input
                          id="carbs"
                          type="number"
                          value={editedFood.carbs}
                          onChange={(e) => updateEditedFood('carbs', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fat" className="text-xs text-muted-foreground">Fat (g)</Label>
                        <Input
                          id="fat"
                          type="number"
                          value={editedFood.fat}
                          onChange={(e) => updateEditedFood('fat', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="fibre" className="text-xs text-muted-foreground">Fibre (g)</Label>
                      <Input
                        id="fibre"
                        type="number"
                        value={editedFood.fibre}
                        onChange={(e) => updateEditedFood('fibre', e.target.value)}
                        className="mt-1"
                      />
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
                    setIsEditing(false);
                    setEditedFood(null);
                  }}
                  className="flex-1"
                >
                  Retake
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!result || analyzing || isEditing}
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
