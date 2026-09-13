interface ProjectionChartProps {
  points: number[];
  startLabel: string;
  endLabel: string;
  unit?: string;
}

/** Soft area chart with dashed gridlines, used on the confidence and summary screens. */
export const ProjectionChart = ({ points, startLabel, endLabel, unit = "kg" }: ProjectionChartProps) => {
  if (points.length < 2) return null;
  const width = 300;
  const height = 140;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;

  const coords = points.map((point, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((point - min) / span) * (height - 24) - 12;
    return { x, y };
  });

  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full" role="img" aria-label="Estimated progress over time">
        <defs>
          <linearGradient id="projection-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.24" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            x2={width}
            y1={height * ratio}
            y2={height * ratio}
            stroke="hsl(var(--border))"
            strokeDasharray="4 6"
            strokeWidth="1"
          />
        ))}
        <path d={area} fill="url(#projection-fill)" />
        <path d={line} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="3.5" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {startLabel} · {points[0]}
          {unit}
        </span>
        <span>
          {endLabel} · {points[points.length - 1]}
          {unit}
        </span>
      </div>
    </div>
  );
};
