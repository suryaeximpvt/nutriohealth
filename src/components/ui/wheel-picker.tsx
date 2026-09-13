import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface WheelPickerProps {
  values: number[];
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  ariaLabel: string;
  className?: string;
}

const ITEM_HEIGHT = 44;

/** Vertical scrolling picker: highlighted centre row, values fading above and below. */
export const WheelPicker = ({ values, value, onChange, suffix, ariaLabel, className }: WheelPickerProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const index = values.indexOf(value);
    if (index < 0 || !listRef.current) return;
    listRef.current.scrollTop = index * ITEM_HEIGHT;
  }, [value, values]);

  const handleScroll = () => {
    if (frame.current) window.clearTimeout(frame.current);
    frame.current = window.setTimeout(() => {
      const node = listRef.current;
      if (!node) return;
      const index = Math.round(node.scrollTop / ITEM_HEIGHT);
      const next = values[Math.max(0, Math.min(values.length - 1, index))];
      if (next !== undefined && next !== value) onChange(next);
    }, 90);
  };

  return (
    <div className={cn("relative h-56 select-none", className)} aria-label={ariaLabel} role="group">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-4 top-1/2 h-11 -translate-y-1/2 rounded-xl bg-muted" />
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="scrollbar-hide relative h-full snap-y overflow-y-scroll"
        style={{ scrollSnapType: "y mandatory", paddingBlock: `${(224 - ITEM_HEIGHT) / 2}px` }}
      >
        {values.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            style={{ height: ITEM_HEIGHT, scrollSnapAlign: "center" }}
            className={cn(
              "flex w-full items-center justify-center text-base",
              item === value ? "text-xl font-bold text-foreground" : "text-muted-foreground",
            )}
          >
            {item}
            {suffix ? ` ${suffix}` : ""}
          </button>
        ))}
      </div>
    </div>
  );
};
