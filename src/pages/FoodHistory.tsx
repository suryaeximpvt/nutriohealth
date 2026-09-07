import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Loader2, Trash2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { FoodSnapFlow } from "@/components/foodsnap/FoodSnapFlow";
import { useFoodCaptures, type FoodCapture } from "@/hooks/useFoodCaptures";
import { MEAL_TYPES, LOCATION_CONTEXTS } from "@/lib/foodSnap";
import { toast } from "sonner";

const FoodHistory = () => {
  const navigate = useNavigate();
  const { captures, loading, deleteCapture, getPhotoUrl, refresh } = useFoodCaptures(30);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [snapOpen, setSnapOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const entries = await Promise.all(
        captures
          .filter((c) => c.photo_path && !urls[c.id])
          .slice(0, 40)
          .map(async (c) => [c.id, await getPhotoUrl(c.photo_path)] as const),
      );
      const next: Record<string, string> = {};
      entries.forEach(([id, url]) => { if (url) next[id] = url; });
      if (Object.keys(next).length) setUrls((u) => ({ ...u, ...next }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captures]);

  const grouped = captures.reduce<Record<string, FoodCapture[]>>((acc, c) => {
    (acc[c.capture_date] ||= []).push(c);
    return acc;
  }, {});

  const remove = async (c: FoodCapture) => {
    await deleteCapture(c);
    toast.success("Photo and entry deleted");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-lg mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Your food history</h1>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Your food photos are private to you. Delete any entry and its photo goes with it.
        </p>

        <Button className="w-full mb-6" onClick={() => setSnapOpen(true)}>
          <Camera className="w-4 h-4 mr-2" /> Snap your food
        </Button>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : captures.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-16">
            No food captures yet. Your first snap starts the picture of what you actually eat.
          </p>
        ) : (
          Object.entries(grouped).map(([date, list]) => (
            <div key={date} className="mb-6">
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">
                {new Date(date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}
              </h2>
              <div className="space-y-3">
                {list.map((c, i) => {
                  const meal = MEAL_TYPES.find((m) => m.value === c.meal_type);
                  const place = LOCATION_CONTEXTS.find((l) => l.value === c.location_context);
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-card rounded-2xl border p-3 flex gap-3"
                    >
                      {urls[c.id] ? (
                        <img src={urls[c.id]} alt={c.food_name ?? "Food photo"} className="w-16 h-16 rounded-xl object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-xl">
                          {meal?.emoji ?? "🍽"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{c.food_name ?? "Food"}</p>
                        <p className="text-xs text-muted-foreground">
                          {meal?.label ?? c.meal_type} ·{" "}
                          {new Date(c.captured_at).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" })}
                          {place ? ` · ${place.label}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">~{c.calories ?? 0} kcal (estimate)</p>
                      </div>
                      <button onClick={() => remove(c)} aria-label="Delete this entry">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <FoodSnapFlow open={snapOpen} onClose={() => setSnapOpen(false)} onSaved={refresh} />
      <BottomNav />
    </div>
  );
};

export default FoodHistory;
