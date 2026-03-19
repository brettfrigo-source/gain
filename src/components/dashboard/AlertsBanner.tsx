"use client";
import { useBudgetContext } from "@/hooks/useBudget";
import { getAlerts } from "@/lib/calculations";
import { useMemo } from "react";

interface Props {
  currentMonth: number;
}

const TYPE_STYLES = {
  overspend: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
};

const TYPE_ICONS = {
  overspend: "!",
  warning: "!",
  info: "i",
  success: "\u2713",
};

export default function AlertsBanner({ currentMonth }: Props) {
  const { budget } = useBudgetContext();
  const alerts = useMemo(() => getAlerts(budget, currentMonth), [budget, currentMonth]);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${TYPE_STYLES[alert.type]}`}
        >
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/60 flex items-center justify-center text-xs font-bold">
            {TYPE_ICONS[alert.type]}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{alert.message}</p>
            {alert.suggestion && (
              <p className="text-xs mt-0.5 opacity-80">{alert.suggestion}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
