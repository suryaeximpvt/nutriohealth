import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useQuickCapture } from "@/hooks/useQuickCapture";
import type { MealType } from "@/lib/foodSnap";

const FIELDS: { meal: MealType; label: string; placeholder: string }[] = [
  { meal: "breakfast", label: "Breakfast", placeholder: "e.g. porridge with berries and a coffee" },
  { meal: "lunch", label: "Lunch", placeholder: "e.g. a chicken sandwich and side salad" },
  { meal: "dinner", label: "Dinner", placeholder: "e.g. grilled chicken, veg and potatoes" },
];

interface Props {
  onSaved?: () => void;
  delay?: number;
}

/** 30-second recovery for a day that never got logged. */
export const DailyRecapCard = ({ onSaved, delay = 0 }: Props) => {
  const { parse, save } = useQuickCapture();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const entries = FIELDS.filter((f) => (values[f.meal] ?? "").trim());
    if (!entries.length) return toast.info("Add at least one meal you remember.");
    setBusy(true);
    let saved = 0;
    for (const f of entries) {
      const { meal: parsed } = await parse(values[f.meal], f.meal);
      if (parsed) {
        const { error } = await save(parsed, "recap", f.meal);
        if (!error) saved += 1;
      }
    }
    setBusy(false);
    if (saved) {
      toast.success(`Recap saved — ${saved} meal${saved > 1 ? "s" : ""} added as estimates.`);
      setValues({});
      setOpen(false);
      onSaved?.();
    } else {
      toast.error("Nutrio couldn't save that recap — please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-2xl p-4 shadow-card"
    >
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 text-left">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <NotebookPen className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">Quick daily recap</p>
          <p className="text-xs text-muted-foreground">
            Didn't log today? Tell Nutrio what you remember — takes 30 seconds.
          </p>
        </div>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          {FIELDS.map((f) => (
            <div key={f.meal}>
              <label className="text-xs font-medium text-muted-foreground" htmlFor={`recap-${f.meal}`}>
                {f.label}
              </label>
              <Textarea
                id={`recap-${f.meal}`}
                value={values[f.meal] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.meal]: e.target.value }))}
                placeholder={f.placeholder}
                className="min-h-16 mt-1"
              />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Nutrition from a recap is an estimate.</p>
          <Button className="w-full" size="lg" disabled={busy} onClick={submit}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save my day"}
          </Button>
        </div>
      )}
    </motion.div>
  );
};
