import { useState } from "react";
import { motion } from "framer-motion";
import { Compass, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLifestyleMode } from "@/hooks/useLifestyleMode";
import {
  LIFESTYLE_MODES,
  DURATION_OPTIONS,
  getModeDef,
  type LifestyleModeDef,
} from "@/lib/lifestyleModes";
import { toast } from "sonner";

const iso = (d: Date) => d.toISOString().split("T")[0];

const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
};

export const LifestyleModeCard = ({ delay = 0 }: { delay?: number }) => {
  const { activeMode, startMode, endMode } = useLifestyleMode();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<LifestyleModeDef | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [duration, setDuration] = useState("today");
  const [customStart, setCustomStart] = useState(iso(new Date()));
  const [customEnd, setCustomEnd] = useState(addDays(3));
  const [saving, setSaving] = useState(false);

  const activeDef = getModeDef(activeMode?.mode_key);

  const openPicker = () => {
    setSelected(null);
    setAnswers({});
    setDuration("today");
    setOpen(true);
  };

  const handleStart = async () => {
    if (!selected) return;
    setSaving(true);
    let starts = iso(new Date());
    let ends = starts;
    if (duration === "tomorrow") {
      starts = addDays(1);
      ends = starts;
    } else if (duration === "weekend") {
      ends = addDays(2);
    } else if (duration === "3_days") {
      ends = addDays(2);
    } else if (duration === "1_week") {
      ends = addDays(6);
    } else if (duration === "custom") {
      starts = customStart;
      ends = customEnd;
    }
    const { error } = await startMode(selected.key, answers, starts, ends);
    setSaving(false);
    if (error) {
      toast.error("Couldn't start that mode. Please try again.");
      return;
    }
    toast.success(`${selected.title} mode is on. Nutrio will adapt.`);
    setOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-card rounded-2xl p-5 shadow-card"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Lifestyle Mode</h2>
          </div>
          {activeMode && (
            <button
              onClick={async () => {
                await endMode();
                toast.success("Back to your normal routine.");
              }}
              className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground"
            >
              <X className="w-3 h-3" /> End
            </button>
          )}
        </div>

        {activeMode && activeDef ? (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                {activeDef.emoji}
              </div>
              <div>
                <p className="font-semibold text-foreground">{activeDef.title}</p>
                <p className="text-xs text-muted-foreground">
                  Until {new Date(activeMode.ends_on).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>
              </div>
            </div>
            <ul className="space-y-1">
              {activeDef.adaptations.map((a) => (
                <li key={a} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-primary">•</span> {a}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full mt-4 rounded-xl" onClick={openPicker}>
              Change mode
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Travelling, busy at work, or celebrating? Tell Nutrio and it will adapt your plan
              instead of expecting a perfect week.
            </p>
            <Button className="w-full rounded-xl" onClick={openPicker}>
              Set today's mode
            </Button>
          </div>
        )}
      </motion.div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[88vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>{selected ? selected.title : "What's happening?"}</SheetTitle>
            <SheetDescription>
              {selected ? selected.tagline : "Pick the mode that fits your next few days."}
            </SheetDescription>
          </SheetHeader>

          {!selected ? (
            <div className="grid grid-cols-2 gap-3 mt-4 pb-6">
              {LIFESTYLE_MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setSelected(m)}
                  className="rounded-2xl border-2 border-border p-4 text-left hover:border-primary/60 transition-all"
                >
                  <div className="text-2xl mb-2">{m.emoji}</div>
                  <p className="font-semibold text-foreground text-sm">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.tagline}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4 space-y-6 pb-6">
              {selected.questions.map((q) => (
                <div key={q.key} className="space-y-2">
                  <Label>{q.label}</Label>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => setAnswers((a) => ({ ...a, [q.key]: o.value }))}
                        className={`px-4 h-10 rounded-xl border-2 text-sm font-medium transition-all ${
                          answers[q.key] === o.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="space-y-2">
                <Label>How long will this mode be active?</Label>
                <div className="flex flex-wrap gap-2">
                  {DURATION_OPTIONS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d.value)}
                      className={`px-4 h-10 rounded-xl border-2 text-sm font-medium transition-all ${
                        duration === d.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {duration === "custom" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <Input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>To</Label>
                    <Input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-muted/50 p-4">
                <p className="text-sm font-medium text-foreground mb-2">Nutrio will</p>
                <ul className="space-y-1">
                  {selected.adaptations.map((a) => (
                    <li key={a} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary">•</span> {a}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setSelected(null)}>
                  Back
                </Button>
                <Button className="flex-1 rounded-xl" onClick={handleStart} disabled={saving}>
                  {saving ? "Starting…" : "Start mode"}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
