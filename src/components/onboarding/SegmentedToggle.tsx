import { cn } from "@/lib/utils";

interface SegmentedToggleProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  label: string;
}

export const SegmentedToggle = ({ value, options, onChange, label }: SegmentedToggleProps) => (
  <div className="rounded-full bg-muted p-1" role="group" aria-label={label}>
    <div className="grid grid-flow-col auto-cols-fr">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn("h-10 rounded-full px-4 text-sm font-semibold", value === option.value ? "bg-card text-foreground shadow-card" : "text-muted-foreground")}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);