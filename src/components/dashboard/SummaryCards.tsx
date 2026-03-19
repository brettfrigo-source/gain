"use client";
import { useBudgetContext } from "@/hooks/useBudget";
import * as calc from "@/lib/calculations";
import { MONTH_NAMES } from "@/lib/defaults";

interface Props {
  currentMonth: number;
}

export default function SummaryCards({ currentMonth }: Props) {
  const { budget } = useBudgetContext();

  const monthIncome = calc.totalIncome(budget, currentMonth);
  const monthExpenses = calc.totalExpenses(budget, currentMonth);
  const monthNet = monthIncome - monthExpenses;
  const eoyForecast = calc.forecastEndOfYear(budget, currentMonth);

  return (
    <section>
      <h1 className="text-5xl font-bold tracking-tight mb-2" style={{ color: "var(--fg)" }}>
        {MONTH_NAMES[currentMonth]}
      </h1>
      <p className="text-lg mb-10" style={{ color: "var(--fg-secondary)" }}>
        Your financial overview at a glance.
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Income", value: monthIncome, color: "var(--success)" },
          { label: "Expenses", value: monthExpenses, color: "var(--danger)" },
          { label: "Net", value: monthNet, color: monthNet >= 0 ? "var(--success)" : "var(--danger)" },
          { label: "Year-end forecast", value: eoyForecast, color: eoyForecast >= 0 ? "var(--fg)" : "var(--danger)" },
        ].map((card) => (
          <div key={card.label} className="card">
            <p className="text-xs font-medium mb-3 tracking-wide uppercase" style={{ color: "var(--fg-tertiary)" }}>
              {card.label}
            </p>
            <p className="text-2xl font-bold tracking-tight" style={{ color: card.color }}>
              {calc.formatCurrency(card.value)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
