import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChoiceRowProps {
  label: string;
  description?: string;
  symbol?: string;
  selected: boolean;
  multiple?: boolean;
  onSelect: () => void;
}

export const ChoiceRow = ({ label, description, symbol, selected, multiple, onSelect }: ChoiceRowProps) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={selected}
    className={cn(
      "flex min-h-[72px] w-full items-center gap-3 rounded-2xl border bg-card p-3 text-left shadow-card transition-[transform,border-color,box-shadow] duration-150",
      selected ? "border-foreground shadow-elevated" : "border-border hover:border-foreground/40",
    )}
  >
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-base text-foreground" aria-hidden="true">
      {symbol ?? label.slice(0, 1)}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-base font-semibold text-foreground">{label}</span>
      {description && <span className="mt-1 block text-sm text-muted-foreground">{description}</span>}
    </span>
    <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center border-2", multiple ? "rounded-md" : "rounded-full", selected ? "border-primary bg-primary" : "border-border bg-card")}>
      {selected && <Check className="h-4 w-4 text-primary-foreground" />}
    </span>
  </button>
);