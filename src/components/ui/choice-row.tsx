import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChoiceRowProps {
  label: string;
  description?: string;
  icon?: LucideIcon;
  glyph?: string;
  selected: boolean;
  multi?: boolean;
  onSelect: () => void;
  className?: string;
}

/**
 * One shared selectable row used by every choice question:
 * neutral card, grey icon circle, label + optional subtext, selector on the right.
 */
export const ChoiceRow = ({
  label,
  description,
  icon: Icon,
  glyph,
  selected,
  multi = false,
  onSelect,
  className,
}: ChoiceRowProps) => (
  <button
    type="button"
    role={multi ? "checkbox" : "radio"}
    aria-checked={selected}
    onClick={onSelect}
    className={cn(
      "press flex w-full items-center gap-4 rounded-2xl border bg-card p-4 text-left",
      selected ? "border-foreground/70 shadow-card" : "border-border",
      className,
    )}
  >
    {(Icon || glyph) && (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-base text-foreground">
        {Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : glyph}
      </span>
    )}
    <span className="min-w-0 flex-1">
      <span className="block truncate text-base font-semibold text-foreground">{label}</span>
      {description && <span className="mt-1 block text-sm text-muted-foreground">{description}</span>}
    </span>
    <span
      aria-hidden="true"
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
        selected ? "border-foreground bg-foreground text-background" : "border-border",
      )}
    >
      {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
    </span>
  </button>
);
