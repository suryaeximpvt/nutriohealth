import { useMemo } from "react";
import { SegmentedToggle } from "./SegmentedToggle";

interface BodyPickersProps {
  heightCm?: number;
  weightKg?: number;
  goalWeightKg?: number;
  onChange: (key: string, value: number) => void;
}

export const BodyPickers = ({ heightCm = 170, weightKg = 70, goalWeightKg, onChange }: BodyPickersProps) => {
  const heightValues = useMemo(() => Array.from({ length: 91 }, (_, index) => 130 + index), []);
  const weightValues = useMemo(() => Array.from({ length: 181 }, (_, index) => 40 + index), []);
  const heightUnit = "cm";
  const weightUnit = "kg";

  return (
    <div className="space-y-8">
      <section aria-labelledby="height-title" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 id="height-title" className="text-xl font-bold text-foreground">Height</h2>
          <SegmentedToggle value={heightUnit} label="Height unit" options={[{ value: "imperial", label: "ft / in" }, { value: "cm", label: "cm" }]} onChange={() => undefined} />
        </div>
        <div className="relative mx-auto h-40 max-w-48 overflow-y-auto snap-y snap-mandatory rounded-2xl bg-muted py-12 text-center scrollbar-hide">
          <div className="pointer-events-none absolute inset-x-0 top-12 h-16 border-y border-border bg-card/80" />
          {heightValues.map((value) => (
            <button key={value} type="button" onClick={() => onChange("height_cm", value)} className={`relative block h-16 w-full snap-center text-xl font-bold ${value === Number(heightCm) ? "text-foreground" : "text-muted-foreground/50"}`}>
              {value} cm
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="weight-title" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 id="weight-title" className="text-xl font-bold text-foreground">Current weight</h2>
          <SegmentedToggle value={weightUnit} label="Weight unit" options={[{ value: "lb", label: "lbs" }, { value: "kg", label: "kg" }]} onChange={() => undefined} />
        </div>
        <p className="text-center text-4xl font-bold text-foreground">{weightKg} <span className="text-base text-muted-foreground">kg</span></p>
        <div className="relative overflow-x-auto rounded-2xl bg-muted px-[50%] py-5 scrollbar-hide">
          <div className="pointer-events-none absolute left-1/2 top-3 h-12 w-0.5 bg-primary" />
          <div className="flex w-max items-end gap-2">
            {weightValues.map((value) => (
              <button key={value} type="button" onClick={() => onChange("weight_kg", value)} aria-label={`${value} kilograms`} className="flex h-12 w-4 shrink-0 items-end justify-center">
                <span className={`block w-px bg-foreground ${value % 5 === 0 ? "h-8" : "h-4"}`} />
              </button>
            ))}
          </div>
        </div>
        <label className="block text-sm font-medium text-muted-foreground">
          Goal weight (optional)
          <input type="number" inputMode="decimal" value={goalWeightKg ?? ""} onChange={(event) => onChange("goal_weight_kg", Number(event.target.value))} className="mt-2 h-12 w-full rounded-xl border border-input bg-card px-4 text-base text-foreground" />
        </label>
      </section>
    </div>
  );
};