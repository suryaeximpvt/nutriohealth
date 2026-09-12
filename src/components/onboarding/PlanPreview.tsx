import { Check, Pencil, Flame, Drumstick, Wheat, Droplets } from "lucide-react";

interface PlanPreviewProps {
  goalLabel: string;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  summary?: boolean;
}

const ProjectionChart = () => (
  <div className="rounded-2xl bg-muted p-5">
    <svg viewBox="0 0 320 150" className="h-36 w-full" role="img" aria-label="Projected progress improves steadily with consistent tracking">
      {[30, 70, 110].map((y) => <line key={y} x1="12" y1={y} x2="308" y2={y} stroke="hsl(var(--border))" strokeDasharray="5 6" />)}
      <path d="M16 122 C75 118 92 96 140 92 S226 58 304 30 L304 138 L16 138 Z" fill="hsl(var(--primary) / 0.10)" />
      <path d="M16 122 C75 118 92 96 140 92 S226 58 304 30" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round" />
      {[{ x: 16, y: 122 }, { x: 140, y: 92 }, { x: 304, y: 30 }].map((point) => <circle key={point.x} cx={point.x} cy={point.y} r="5" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="3" />)}
      <text x="16" y="149" fontSize="12" fill="hsl(var(--muted-foreground))">Start</text>
      <text x="272" y="149" fontSize="12" fill="hsl(var(--muted-foreground))">Goal</text>
    </svg>
  </div>
);

export const PlanPreview = ({ goalLabel, calorieTarget, proteinTarget, carbsTarget, fatTarget, summary }: PlanPreviewProps) => (
  <div className="space-y-5">
    {summary && <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary"><Check className="h-8 w-8 text-primary-foreground" /></div>}
    <ProjectionChart />
    <p className="text-sm text-muted-foreground">Your projected direction for {goalLabel.toLowerCase()} is based on the details you entered. Daily results will naturally vary.</p>
    {summary && (
      <div className="rounded-2xl bg-muted p-5">
        <h2 className="text-xl font-bold text-foreground">Your daily recommendation</h2>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-3"><Flame className="h-5 w-5 text-foreground" /><div><p className="text-xs text-muted-foreground">Calories</p><p className="text-2xl font-bold text-primary">{calorieTarget} kcal</p></div></div>
          <Pencil className="h-4 w-4 text-muted-foreground" aria-label="Editable after setup" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[[Drumstick, "Protein", proteinTarget], [Wheat, "Carbs", carbsTarget], [Droplets, "Fats", fatTarget]].map(([Icon, label, value]) => {
            const MacroIcon = Icon as typeof Drumstick;
            return <div key={String(label)} className="rounded-xl bg-card p-3 text-center shadow-card"><MacroIcon className="mx-auto h-4 w-4 text-muted-foreground" /><p className="mt-2 text-xs text-muted-foreground">{String(label)}</p><p className="text-base font-bold text-foreground">{String(value)}g</p></div>;
          })}
        </div>
      </div>
    )}
  </div>
);