import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedToggleProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}

/** Pill-shaped unit switch: light track, white selected segment. */
export const SegmentedToggle = <T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedToggleProps<T>) => (
  <div
    role="radiogroup"
    aria-label={ariaLabel}
    className={cn("inline-flex items-center gap-1 rounded-full bg-muted p-1", className)}
  >
    {options.map((option) => {
      const active = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(option.value)}
          className={cn(
            "press min-h-11 rounded-full px-4 text-sm font-semibold",
            active ? "bg-card text-foreground shadow-card" : "text-muted-foreground",
          )}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
