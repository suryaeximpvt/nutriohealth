import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Apple,
  BedDouble,
  ChevronDown,
  Flame,
  Footprints,
  Heart,
  Loader2,
  RefreshCw,
  Watch,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  useHealthData,
  type HealthProvider,
  type MetricInput,
} from "@/hooks/useHealthData";
import { appleHealthAvailable, readAppleHealthToday } from "@/lib/appleHealth";

const PROVIDERS: {
  key: HealthProvider;
  name: string;
  icon: typeof Apple;
  blurb: string;
}[] = [
  {
    key: "apple_health",
    name: "Apple Health",
    icon: Apple,
    blurb: "Steps, active calories, resting heart rate and sleep",
  },
  {
    key: "whoop",
    name: "Whoop",
    icon: Watch,
    blurb: "Recovery, strain, sleep and heart rate variability",
  },
];

const FIELDS: Record<
  HealthProvider,
  { key: keyof MetricInput; label: string; unit: string; icon: typeof Heart }[]
> = {
  apple_health: [
    { key: "steps", label: "Steps", unit: "", icon: Footprints },
    { key: "active_calories", label: "Active cal", unit: "kcal", icon: Flame },
    { key: "resting_heart_rate", label: "Resting HR", unit: "bpm", icon: Heart },
    { key: "sleep_hours", label: "Sleep", unit: "h", icon: BedDouble },
  ],
  whoop: [
    { key: "recovery_score", label: "Recovery", unit: "%", icon: Zap },
    { key: "strain", label: "Strain", unit: "", icon: Activity },
    { key: "sleep_hours", label: "Sleep", unit: "h", icon: BedDouble },
    { key: "hrv_ms", label: "HRV", unit: "ms", icon: Heart },
  ],
};

export const HealthTrackingCard = ({ delay = 0 }: { delay?: number }) => {
  const { isConnected, lastSynced, setConnected, saveMetrics, todayFor, weekFor, loading } =
    useHealthData();
  const [active, setActive] = useState<HealthProvider>("apple_health");
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<HealthProvider | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const connected = isConnected(active);
  const todayData = todayFor(active);
  const week = weekFor(active);
  const synced = lastSynced(active);

  const handleConnect = async (provider: HealthProvider) => {
    setBusy(true);
    if (provider === "apple_health" && appleHealthAvailable()) {
      const sample = await readAppleHealthToday();
      await setConnected(provider, true);
      if (sample) await saveMetrics(provider, sample);
      setBusy(false);
      toast.success("Apple Health connected — today's figures are in.");
      return;
    }
    await setConnected(provider, true);
    setBusy(false);
    setEditing(provider);
    setForm({});
    toast.success(
      provider === "apple_health"
        ? "Apple Health links up automatically in the iPhone app. Add today's numbers here for now."
        : "Whoop added. Pop in today's numbers and we'll track them alongside your food."
    );
  };

  const handleSync = async () => {
    setBusy(true);
    if (active === "apple_health" && appleHealthAvailable()) {
      const sample = await readAppleHealthToday();
      if (sample) await saveMetrics(active, sample);
      setBusy(false);
      toast.success("Synced with Apple Health.");
      return;
    }
    setBusy(false);
    const t = todayFor(active);
    setForm(
      Object.fromEntries(
        FIELDS[active].map((f) => [f.key as string, t?.[f.key as keyof typeof t] != null ? String(t![f.key as keyof typeof t]) : ""])
      )
    );
    setEditing(active);
  };

  const handleSave = async () => {
    if (!editing) return;
    setBusy(true);
    const values: MetricInput = {};
    FIELDS[editing].forEach((f) => {
      const raw = form[f.key as string];
      if (raw !== undefined && raw !== "") {
        (values as Record<string, number>)[f.key as string] = Number(raw);
      }
    });
    const { error } = await saveMetrics(editing, values);
    setBusy(false);
    if (error) {
      toast.error("We couldn't save that. Please try again.");
      return;
    }
    setEditing(null);
    toast.success("Today's health figures are updated.");
  };

  const maxSteps = Math.max(1, ...week.map((d) => d.steps ?? d.strain ?? 0));

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-card rounded-2xl p-4 shadow-card"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground">Health Tracking</h3>
            <p className="text-xs text-muted-foreground">
              {synced
                ? `Last updated ${new Date(synced).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Connect a device to see your daily numbers"}
            </p>
          </div>
          {connected && (
            <button
              onClick={handleSync}
              disabled={busy}
              className="flex items-center gap-1 text-xs font-semibold text-primary px-2 py-1 bg-primary/10 rounded-full disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              Update
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          {PROVIDERS.map((p) => {
            const on = active === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setActive(p.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border text-xs font-semibold transition-all ${
                  on
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                <p.icon className="w-3.5 h-3.5" />
                {p.name}
                {isConnected(p.key) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="h-20 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : !connected ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              {PROVIDERS.find((p) => p.key === active)?.blurb}
            </p>
            <Button
              onClick={() => handleConnect(active)}
              disabled={busy}
              className="rounded-xl h-10 px-6"
            >
              {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Connect {PROVIDERS.find((p) => p.key === active)?.name}
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-2">
              {FIELDS[active].map((f) => {
                const value = todayData?.[f.key as keyof typeof todayData];
                return (
                  <div key={String(f.key)} className="text-center">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
                      <f.icon className="w-4 h-4 text-primary" />
                    </div>
                    <p className="font-bold text-foreground text-sm">
                      {value != null ? Number(value).toLocaleString() : "—"}
                      {value != null && f.unit && (
                        <span className="text-[10px] text-muted-foreground ml-0.5">
                          {f.unit}
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{f.label}</p>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setExpanded((e) => !e)}
              className="w-full flex items-center justify-center gap-1 mt-3 pt-3 border-t border-border text-xs font-semibold text-muted-foreground"
            >
              Last 7 days
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  {week.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center pt-3">
                      Nothing recorded yet this week.
                    </p>
                  ) : (
                    <div className="flex items-end justify-between gap-2 h-24 pt-3">
                      {week.map((d) => {
                        const v = active === "whoop" ? d.strain ?? 0 : d.steps ?? 0;
                        const h = Math.max(6, (Number(v) / maxSteps) * 100);
                        return (
                          <div key={d.id} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className="w-full rounded-t-md bg-primary/70"
                              style={{ height: `${h}%` }}
                            />
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(d.metric_date).toLocaleDateString("en-GB", {
                                weekday: "narrow",
                              })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setConnected(active, false)}
              className="w-full text-[11px] text-muted-foreground mt-3"
            >
              Disconnect {PROVIDERS.find((p) => p.key === active)?.name}
            </button>
          </>
        )}
      </motion.div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Today's {editing === "whoop" ? "Whoop" : "Apple Health"} numbers
            </DialogTitle>
            <DialogDescription>
              {editing === "whoop"
                ? "Copy these across from your Whoop app — Nutrio uses them to shape your food and training advice."
                : "In the iPhone app these fill in on their own. Here you can pop them in yourself."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {(FIELDS[editing ?? "apple_health"] ?? []).map((f) => (
              <div key={String(f.key)} className="space-y-1.5">
                <Label className="text-sm">
                  {f.label} {f.unit && <span className="text-muted-foreground">({f.unit})</span>}
                </Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={form[f.key as string] ?? ""}
                  onChange={(e) =>
                    setForm((v) => ({ ...v, [f.key as string]: e.target.value }))
                  }
                  className="h-11 rounded-xl"
                />
              </div>
            ))}
            <Button onClick={handleSave} disabled={busy} className="w-full h-11 rounded-xl">
              {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save today's numbers
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
