import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
  Check,
  Info,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DAY_CONTEXTS,
  LOCATION_CONTEXTS,
  MEAL_TYPES,
  PORTIONS,
  guessMealType,
  num,
  type MealType,
  type PortionSize,
  type SnapAnalysis,
  type SnapItem,
} from "@/lib/foodSnap";
import { useFoodCaptures } from "@/hooks/useFoodCaptures";

type Step = "source" | "confirm" | "analysing" | "review";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultMealType?: MealType;
  onSaved?: () => void;
}

const blankItem = (): SnapItem => ({
  id: crypto.randomUUID(),
  name: "",
  portion_size: "medium",
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fibre: 0,
  origin: "user",
  edited: true,
});

export const FoodSnapFlow = ({ open, onClose, defaultMealType, onSaved }: Props) => {
  const { saveCapture, saving } = useFoodCaptures();
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("source");
  const [source, setSource] = useState<"camera" | "upload" | "recent">("camera");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [items, setItems] = useState<SnapItem[]>([]);
  const [detected, setDetected] = useState<unknown>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [mealType, setMealType] = useState<MealType>(defaultMealType ?? guessMealType());
  const [portion, setPortion] = useState<PortionSize>("medium");
  const [locationContext, setLocationContext] = useState<string | null>(null);
  const [dayContext, setDayContext] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edited, setEdited] = useState(false);

  const reset = () => {
    setStep("source");
    setFile(null);
    setPreview(null);
    setDataUrl(null);
    setItems([]);
    setDetected([]);
    setIngredients([]);
    setConfidence(null);
    setPortion("medium");
    setLocationContext(null);
    setDayContext(null);
    setEditingId(null);
    setEdited(false);
    setMealType(defaultMealType ?? guessMealType());
  };

  useEffect(() => {
    if (open) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleFile = (f: File | undefined, src: "camera" | "upload" | "recent") => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Please choose a photo");
      return;
    }
    setSource(src);
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPreview(url);
      setDataUrl(url);
      setStep("confirm");
    };
    reader.readAsDataURL(f);
  };

  const analyse = async () => {
    if (!dataUrl) return;
    setStep("analysing");
    const { data, error } = await supabase.functions.invoke("analyze-food-snap", {
      body: { image: dataUrl, mealTypeHint: mealType, timeOfDay: new Date().toTimeString().slice(0, 5) },
    });

    if (error || data?.error) {
      toast.error(data?.error ?? "Nutrio couldn't read that photo — you can still add the food yourself.");
      setItems([blankItem()]);
      setStep("review");
      return;
    }

    const a = (data?.analysis ?? {}) as SnapAnalysis;
    const parsed: SnapItem[] = (a.items ?? []).map((i) => ({
      id: crypto.randomUUID(),
      name: String(i.name ?? "Food"),
      portion_size: (i.portion_size as PortionSize) ?? "medium",
      calories: num(i.calories),
      protein: num(i.protein),
      carbs: num(i.carbs),
      fat: num(i.fat),
      fibre: num(i.fibre),
      origin: "ai",
      edited: false,
    }));

    setDetected(a.items ?? []);
    setIngredients(a.ingredients ?? []);
    setConfidence(typeof a.confidence === "number" ? a.confidence : null);
    if (a.meal_type) setMealType(a.meal_type);
    if (a.portion_size) setPortion(a.portion_size);
    setItems(parsed.length ? parsed : [blankItem()]);
    setStep("review");
  };

  const updateItem = (id: string, patch: Partial<SnapItem>) => {
    setEdited(true);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch, edited: true } : i)));
  };

  const removeItem = (id: string) => {
    setEdited(true);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const applyPortion = (p: PortionSize) => {
    const current = PORTIONS.find((x) => x.value === portion)?.factor ?? 1;
    const next = PORTIONS.find((x) => x.value === p)?.factor ?? 1;
    const ratio = next / current;
    setPortion(p);
    setEdited(true);
    setItems((prev) =>
      prev.map((i) => ({
        ...i,
        portion_size: p,
        calories: Math.round(i.calories * ratio),
        protein: Math.round(i.protein * ratio * 10) / 10,
        carbs: Math.round(i.carbs * ratio * 10) / 10,
        fat: Math.round(i.fat * ratio * 10) / 10,
        fibre: Math.round(i.fibre * ratio * 10) / 10,
      })),
    );
  };

  const totals = items.reduce(
    (t, i) => ({
      calories: t.calories + i.calories,
      protein: t.protein + i.protein,
      carbs: t.carbs + i.carbs,
      fat: t.fat + i.fat,
      fibre: t.fibre + i.fibre,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 },
  );

  const save = async () => {
    const kept = items.filter((i) => i.name.trim());
    if (!kept.length) {
      toast.error("Add at least one food before saving");
      return;
    }
    const res = await saveCapture({
      file,
      mealType,
      portionSize: portion,
      items: kept,
      detected,
      locationContext,
      dayContext,
      edited,
      confidence,
      source,
    });
    if (res?.error) {
      toast.error("Couldn't save that — please try again");
      return;
    }
    toast.success("Saved. Nutrio has learned a bit more about what you actually eat.");
    onSaved?.();
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="h-[92vh] overflow-y-auto rounded-t-3xl p-0">
        <SheetHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur px-5 py-4 border-b">
          <SheetTitle className="text-left">
            {step === "source" && "Snap your food"}
            {step === "confirm" && "Is this the food you ate?"}
            {step === "analysing" && "Looking at your photo"}
            {step === "review" && "Check what Nutrio found"}
          </SheetTitle>
        </SheetHeader>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0], "camera")}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0], "upload")}
        />

        <div className="px-5 py-5 space-y-4">
          <AnimatePresence mode="wait">
            {step === "source" && (
              <motion.div key="source" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Nutrio only ever sees the photo you choose. Nothing is taken from your phone automatically.
                </p>
                <button
                  onClick={() => cameraRef.current?.click()}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 flex items-center gap-4 text-left"
                >
                  <Camera className="w-6 h-6 text-primary-foreground" />
                  <div>
                    <p className="font-semibold text-primary-foreground">Take a photo</p>
                    <p className="text-sm text-primary-foreground/80">Use your camera now</p>
                  </div>
                </button>
                <button
                  onClick={() => galleryRef.current?.click()}
                  className="w-full bg-card border rounded-2xl p-5 flex items-center gap-4 text-left"
                >
                  <ImageIcon className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Upload a food photo</p>
                    <p className="text-sm text-muted-foreground">Choose a picture from this device</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setSource("recent");
                    galleryRef.current?.click();
                  }}
                  className="w-full bg-card border rounded-2xl p-5 flex items-center gap-4 text-left"
                >
                  <span className="text-2xl">🕘</span>
                  <div>
                    <p className="font-semibold text-foreground">Pick a recent food photo</p>
                    <p className="text-sm text-muted-foreground">You choose and confirm the picture yourself</p>
                  </div>
                </button>
              </motion.div>
            )}

            {step === "confirm" && preview && (
              <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <img src={preview} alt="The food you photographed" className="w-full rounded-2xl object-cover max-h-80" />
                <div className="grid grid-cols-3 gap-2">
                  <Button onClick={analyse} className="col-span-1">
                    <Check className="w-4 h-4 mr-1" /> Yes
                  </Button>
                  <Button variant="outline" onClick={() => { setItems([blankItem()]); setStep("review"); }}>
                    <Pencil className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" onClick={reset}>
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "analysing" && (
              <motion.div key="analysing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground text-sm">Working out what's on the plate…</p>
              </motion.div>
            )}

            {step === "review" && (
              <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                {preview && (
                  <img src={preview} alt="The food you photographed" className="w-full rounded-2xl object-cover max-h-48" />
                )}

                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-xl p-3">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Everything below is an estimate to help spot patterns — it isn't exact or medical advice.
                    {confidence !== null && ` Nutrio's confidence: ${Math.round(confidence * 100)}%.`}
                  </span>
                </div>

                <div>
                  <Label className="text-sm">Meal type</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {MEAL_TYPES.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setMealType(m.value)}
                        className={`rounded-xl border p-2 text-xs ${mealType === m.value ? "border-primary bg-primary/10 text-foreground" : "text-muted-foreground"}`}
                      >
                        <div className="text-base">{m.emoji}</div>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Portion</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {PORTIONS.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => applyPortion(p.value)}
                        className={`rounded-xl border p-2 text-sm ${portion === p.value ? "border-primary bg-primary/10 text-foreground" : "text-muted-foreground"}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {ingredients.length > 0 && (
                  <div>
                    <Label className="text-sm">Estimated ingredients</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ingredients.map((ing) => (
                        <span key={ing} className="text-xs bg-muted rounded-full px-3 py-1 text-muted-foreground">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm">Food detected</Label>
                  {items.map((item) => (
                    <div key={item.id} className="border rounded-2xl p-3 bg-card">
                      <div className="flex items-center gap-2">
                        <Input
                          value={item.name}
                          placeholder="Food name"
                          onChange={(e) => updateItem(item.id, { name: e.target.value })}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit nutrition estimates"
                          onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Remove this food" onClick={() => removeItem(item.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        ~{Math.round(item.calories)} kcal · P {item.protein}g · C {item.carbs}g · F {item.fat}g · Fibre {item.fibre}g
                      </p>
                      {editingId === item.id && (
                        <div className="grid grid-cols-5 gap-2 mt-3">
                          {(["calories", "protein", "carbs", "fat", "fibre"] as const).map((k) => (
                            <div key={k}>
                              <Label className="text-[10px] capitalize">{k === "calories" ? "kcal" : k}</Label>
                              <Input
                                type="number"
                                inputMode="decimal"
                                value={item[k]}
                                onChange={(e) => updateItem(item.id, { [k]: num(e.target.value) } as Partial<SnapItem>)}
                                className="h-9 px-2 text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => { setEdited(true); setItems((p) => [...p, blankItem()]); }}>
                    <Plus className="w-4 h-4 mr-1" /> Add another food
                  </Button>
                </div>

                <div>
                  <Label className="text-sm">Where were you? (optional)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {LOCATION_CONTEXTS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setLocationContext(locationContext === c.value ? null : c.value)}
                        className={`rounded-full border px-3 py-1.5 text-xs ${locationContext === c.value ? "border-primary bg-primary/10 text-foreground" : "text-muted-foreground"}`}
                      >
                        {c.emoji} {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm">How's your day? (optional)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {DAY_CONTEXTS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setDayContext(dayContext === c.value ? null : c.value)}
                        className={`rounded-full border px-3 py-1.5 text-xs ${dayContext === c.value ? "border-primary bg-primary/10 text-foreground" : "text-muted-foreground"}`}
                      >
                        {c.emoji} {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/50 rounded-2xl p-4 text-sm">
                  <p className="font-semibold text-foreground">
                    Estimated total: ~{Math.round(totals.calories)} kcal
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Protein {Math.round(totals.protein)}g · Carbs {Math.round(totals.carbs)}g · Fat {Math.round(totals.fat)}g · Fibre {Math.round(totals.fibre)}g
                  </p>
                </div>

                <div className="flex gap-2 pb-6">
                  <Button variant="ghost" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button className="flex-[2]" onClick={save} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                    Confirm & save
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
};
