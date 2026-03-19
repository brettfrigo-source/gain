"use client";
import { useState } from "react";
import { useBudgetContext } from "@/hooks/useBudget";
import * as calc from "@/lib/calculations";
import { MONTH_NAMES } from "@/lib/defaults";
import MonthDetail from "./MonthDetail";

export default function AnnualOverview() {
  const { budget } = useBudgetContext();
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  if (selectedMonth !== null) {
    return (
      <div>
        <button
          onClick={() => setSelectedMonth(null)}
          className="btn-ghost mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-1.5">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          All months
        </button>
        <MonthDetail month={selectedMonth} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="section-title mb-2">{budget.year} Budget</h1>
      <p className="section-subtitle mb-10">Click any month to view details and add transactions.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MONTH_NAMES.map((name, i) => {
          const income = calc.totalIncome(budget, i);
          const expenses = calc.totalExpenses(budget, i);
          const net = income - expenses;
          const hasData = income > 0 || expenses > 0;

          return (
            <button
              key={i}
              onClick={() => setSelectedMonth(i)}
              className="card text-left transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:shadow-black/[0.03] group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-semibold" style={{ color: "var(--fg)" }}>{name}</span>
                {hasData && (
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{
                      background: net >= 0 ? "rgba(52,199,89,0.08)" : "rgba(255,59,48,0.08)",
                      color: net >= 0 ? "var(--success)" : "var(--danger)",
                    }}
                  >
                    {net >= 0 ? "+" : ""}{calc.formatCurrency(net)}
                  </span>
                )}
              </div>
              {hasData ? (
                <div className="flex gap-6">
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: "var(--fg-tertiary)" }}>In</p>
                    <p className="text-sm font-semibold" style={{ color: "var(--success)" }}>
                      {calc.formatCurrency(income)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: "var(--fg-tertiary)" }}>Out</p>
                    <p className="text-sm font-semibold" style={{ color: "var(--danger)" }}>
                      {calc.formatCurrency(expenses)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm" style={{ color: "var(--fg-tertiary)" }}>No transactions</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Year total */}
      <div className="mt-8 card" style={{ background: "var(--bg-secondary)" }}>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "var(--fg-tertiary)" }}>
              Annual total
            </p>
            <p className="text-2xl font-bold tracking-tight" style={{
              color: calc.yearToDateIncome(budget, 11) - calc.yearToDateExpenses(budget, 11) >= 0
                ? "var(--success)" : "var(--danger)"
            }}>
              {calc.formatCurrency(calc.yearToDateIncome(budget, 11) - calc.yearToDateExpenses(budget, 11))}
            </p>
          </div>
          <div className="flex gap-8">
            <div>
              <p className="text-xs" style={{ color: "var(--fg-tertiary)" }}>Income</p>
              <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
                {calc.formatCurrency(calc.yearToDateIncome(budget, 11))}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--fg-tertiary)" }}>Expenses</p>
              <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
                {calc.formatCurrency(calc.yearToDateExpenses(budget, 11))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
