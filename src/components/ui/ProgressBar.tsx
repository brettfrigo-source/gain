interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  size?: "sm" | "md" | "lg";
}

export default function ProgressBar({
  value,
  max,
  color = "var(--accent)",
  size = "md",
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const overBudget = value > max && max > 0;
  const barColor = overBudget ? "var(--danger)" : color;
  const heights = { sm: "h-1", md: "h-1.5", lg: "h-2" };

  return (
    <div className={`w-full rounded-full overflow-hidden ${heights[size]}`} style={{ background: "var(--bg-secondary)" }}>
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
      />
    </div>
  );
}
