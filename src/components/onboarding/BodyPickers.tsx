import { useEffect, useMemo, useState } from "react";
import { SegmentedToggle } from "./SegmentedToggle";

interface BodyPickersProps {
  heightCm?: number;
  weightKg?: number;
  goalWeightKg?: number;
  onChange: (key: string, value: number) => void;
}

const KG_PER_LB = 0.45359237;

const toFeetInches = (cm: number) => {
  const totalInches = Math.round(cm / 2.54);
  return { feet: Math.floor(totalInches / 12), inches: totalInches % 12 };
};

export const BodyPickers = ({ heightCm = 170, weightKg = 70, goalWeightKg, onChange }: BodyPickersProps) => {
  const heightValues = useMemo(() => Array.from({ length: 91 }, (_, index) => 130 + index), []);
  const weightValues = useMemo(() => Array.from({ length: 181 }, (_, index) => 40 + index), []);
  const [heightUnit, setHeightUnit] = useState("cm");
  const [weightUnit, setWeightUnit] = useState("kg");

  // The screen opens on sensible defaults, so record them straight away —
  // otherwise Continue stays disabled for anyone those defaults already suit.
  useEffect(() => {
    onChange("height_cm", Number(heightCm));
    onChange("weight_kg", Number(weightKg));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heightLabel = (value: number) => {
    if (heightUnit === "cm") return `${value} cm`;
    const { feet, inches } = toFeetInches(value);
    return `${feet}' ${inches}"`;
  };

  const weightDisplay = weightUnit === "kg"
    ? `${Math.round(Number(weightKg))} kg`
    : `${Math.round(Number(weightKg) / KG_PER_LB)} lbs`;

  const stepWeight = (delta: number) => {
    const next = Math.min(220, Math.max(40, Math.round(Number(weightKg) + delta)));
    onChange("weight_kg", next);
  };

  return (
    <div className="space-y-8">
      <section aria-labelledby="height-title" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 id="height-title" className="text-xl font-bold text-foreground">Height</h2>
          <SegmentedToggle value={heightUnit} label="Height unit" options={[{ value: "imperial", label: "ft / in" }, { value: "cm", label: "cm" }]} onChange={setHeightUnit} />
        </div>
        <p className="text-center text-2xl font-bold text-foreground">{heightLabel(Number(heightCm))}</p>
        <div className="relative mx-auto h-40 max-w-48 overflow-y-auto snap-y snap-mandatory rounded-2xl bg-muted py-12 text-center scrollbar-hide">
          <div className="pointer-events-none absolute inset-x-0 top-12 h-16 border-y border-border bg-card/80" />
          {heightValues.map((value) => (
            <button key={value} type="button" onClick={() => onChange("height_cm", value)} className={`relative block h-16 w-full snap-center text-xl font-bold ${value === Number(heightCm) ? "text-foreground" : "text-muted-foreground/50"}`}>
              {heightLabel(value)}
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="weight-title" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 id="weight-title" className="text-xl font-bold text-foreground">Current weight</h2>
          <SegmentedToggle value={weightUnit} label="Weight unit" options={[{ value: "lb", label: "lbs" }, { value: "kg", label: "kg" }]} onChange={setWeightUnit} />
        </div>

        <div className="flex items-center justify-center gap-4">
          <button type="button" onClick={() => stepWeight(-1)} aria-label="Decrease weight" className="h-11 w-11 rounded-full bg-muted text-xl font-bold text-foreground active:scale-95 transition-transform">-</button>
          <p className="min-w-32 text-center text-4xl font-bold text-foreground">{weightDisplay}</p>
          <button type="button" onClick={() => stepWeight(1)} aria-label="Increase weight" className="h-11 w-11 rounded-full bg-muted text-xl font-bold text-foreground active:scale-95 transition-transform">+</button>
        </div>

        <div className="relative overflow-x-auto rounded-2xl bg-muted px-[50%] py-5 scrollbar-hide">
          <div className="pointer-events-none absolute left-1/2 top-3 h-12 w-0.5 bg-primary" />
          <div className="flex w-max items-end gap-2">
            {weightValues.map((value) => (
              <button key={value} type="button" onClick={() => onChange("weight_kg", value)} aria-label={`${value} kilograms`} className="flex h-14 w-4 shrink-0 flex-col items-center justify-end">
                <span className={`block w-px bg-foreground ${value % 5 === 0 ? "h-8" : "h-4"}`} />
                <span className="mt-1 h-3 text-[10px] leading-3 text-muted-foreground">
                  {value % 10 === 0 ? (weightUnit === "kg" ? value : Math.round(value / KG_PER_LB)) : ""}
                </span>
              </button>
            ))}
          </div>
        </div>

        <label className="block text-sm font-medium text-muted-foreground">
          Goal weight (optional, {weightUnit === "kg" ? "kg" : "lbs"})
          <input
            type="number"
            inputMode="decimal"
            value={goalWeightKg === undefined ? "" : weightUnit === "kg" ? goalWeightKg : Math.round(goalWeightKg / KG_PER_LB)}
            onChange={(event) => {
              const entered = Number(event.target.value);
              onChange("goal_weight_kg", weightUnit === "kg" ? entered : Math.round(entered * KG_PER_LB));
            }}
            className="mt-2 h-12 w-full rounded-xl border border-input bg-card px-4 text-base text-foreground"
          />
        </label>
      </section>
    </div>
  );
};
