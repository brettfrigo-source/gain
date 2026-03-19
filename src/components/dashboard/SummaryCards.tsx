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
  const ytdIncome = calc.yearToDateIncome(budget, currentMonth);
  const ytdExpenses = calc.yearToDateExpenses(budget, currentMonth);
  const ytdNet = ytdIncome - ytdExpenses;
  const eoyForecast = calc.forecastEndOfYear(budget, currentMonth);

  const cards = [
    {
      label: `${MONTH_NAMES[currentMonth]} Income`,
      value: monthIncome,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: `${MONTH_NAMES[currentMonth]} Expenses`,
      value: monthExpenses,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: `${MONTH_NAMES[currentMonth]} Net`,
      value: monthNet,
      color: monthNet >= 0 ? "text-emerald-600" : "text-red-600",
      bg: monthNet >= 0 ? "bg-emerald-50" : "bg-red-50",
    },
    {
      label: "Year-to-Date Net",
      value: ytdNet,
      color: ytdNet >= 0 ? "text-indigo-600" : "text-red-600",
      bg: ytdNet >= 0 ? "bg-indigo-50" : "bg-red-50",
    },
    {
      label: "End-of-Year Forecast",
      value: eoyForecast,
      color: eoyForecast >= 0 ? "text-blue-600" : "text-red-600",
      bg: eoyForecast >= 0 ? "bg-blue-50" : "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bg} rounded-xl p-4 border border-slate-100`}
        >
          <p className="text-xs font-medium text-slate-500 mb-1">{card.label}</p>
          <p className={`text-xl font-bold ${card.color}`}>
            {calc.formatCurrency(card.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
