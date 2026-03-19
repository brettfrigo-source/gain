"use client";
import { useBudgetContext } from "@/hooks/useBudget";
import { getAlerts, Alert } from "@/lib/calculations";
import { useMemo } from "react";

interface Props {
  currentMonth: number;
}

const STYLES: Record<Alert["type"], { bg: string; text: string }> = {
  overspend: { bg: "rgba(255, 59, 48, 0.06)", text: "var(--danger)" },
  warning: { bg: "rgba(255, 159, 10, 0.06)", text: "var(--warning)" },
  info: { bg: "rgba(0, 113, 227, 0.06)", text: "var(--accent)" },
  success: { bg: "rgba(52, 199, 89, 0.06)", text: "var(--success)" },
};

export default function AlertsBanner({ currentMonth }: Props) {
  const { budget } = useBudgetContext();
  const alerts = useMemo(() => getAlerts(budget, currentMonth), [budget, currentMonth]);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.slice(0, 3).map((alert, i) => (
        <div
          key={i}
          className="flex items-start gap-4 px-5 py-4 rounded-2xl transition-all duration-200"
          style={{ background: STYLES[alert.type].bg }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: STYLES[alert.type].text }}>
              {alert.message}
            </p>
            {alert.suggestion && (
              <p className="text-sm mt-1" style={{ color: "var(--fg-secondary)" }}>
                {alert.suggestion}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
