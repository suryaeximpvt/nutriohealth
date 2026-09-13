import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface RulerPickerProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  ariaLabel: string;
  className?: string;
}

const STEP_PX = 12;

/** Horizontal ruler with tick marks and a fixed centre indicator. */
export const RulerPicker = ({ min, max, value, onChange, ariaLabel, className }: RulerPickerProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    node.scrollLeft = (value - min) * STEP_PX;
  }, [value, min]);

  const handleScroll = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const node = trackRef.current;
      if (!node) return;
      const next = Math.round(node.scrollLeft / STEP_PX) + min;
      const clamped = Math.max(min, Math.min(max, next));
      if (clamped !== value) onChange(clamped);
    }, 90);
  };

  return (
    <div className={cn("relative", className)} role="group" aria-label={ariaLabel}>
      <div className="pointer-events-none absolute left-1/2 top-0 z-10 h-16 w-0.5 -translate-x-1/2 rounded-full bg-primary" />
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="scrollbar-hide flex h-16 items-end overflow-x-scroll"
        style={{ paddingInline: "50%" }}
      >
        {ticks.map((tick) => {
          const major = tick % 5 === 0;
          return (
            <span
              key={tick}
              style={{ width: STEP_PX }}
              className="flex shrink-0 flex-col items-center justify-end gap-1"
            >
              <span className={cn("w-0.5 rounded-full bg-border", major ? "h-8" : "h-4")} />
            </span>
          );
        })}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        aria-label={ariaLabel}
        onChange={(event) => onChange(Number(event.target.value))}
        className="sr-only"
      />
    </div>
  );
};
