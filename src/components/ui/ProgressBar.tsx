interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function ProgressBar({
  value,
  max,
  color = "#6366f1",
  showLabel = true,
  size = "md",
}: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const overBudget = value > max && max > 0;
  const barColor = overBudget ? "#ef4444" : color;
  const heights = { sm: "h-2", md: "h-3", lg: "h-4" };

  return (
    <div className="w-full">
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-slate-500">
          <span className={overBudget ? "text-red-500 font-medium" : ""}>
            ${value.toLocaleString()}
          </span>
          <span>${max.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
