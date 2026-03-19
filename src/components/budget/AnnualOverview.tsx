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
          className="text-sm text-indigo-600 hover:text-indigo-800 mb-4 flex items-center gap-1"
        >
          &larr; Back to Annual Overview
        </button>
        <MonthDetail month={selectedMonth} />
      </div>
    );
  }

  const totalBudgeted = budget.categories.reduce((s, c) => s + c.budgetedMonthly, 0);

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Annual Overview — {budget.year}</h2>
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Month</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Income</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Expenses</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Budgeted</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Net</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {MONTH_NAMES.map((name, i) => {
              const income = calc.totalIncome(budget, i);
              const expenses = calc.totalExpenses(budget, i);
              const net = income - expenses;
              const hasData = income > 0 || expenses > 0;

              return (
                <tr
                  key={i}
                  onClick={() => setSelectedMonth(i)}
                  className="border-b border-slate-100 hover:bg-indigo-50/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">{name}</td>
                  <td className="px-4 py-3 text-right text-emerald-600">
                    {hasData ? calc.formatCurrency(income) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-red-500">
                    {hasData ? calc.formatCurrency(expenses) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500">
                    {calc.formatCurrency(totalBudgeted)}
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${net >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {hasData ? calc.formatCurrency(net) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!hasData ? (
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-xs">
                        No data
                      </span>
                    ) : expenses > totalBudgeted ? (
                      <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                        Over budget
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">
                        On track
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-semibold">
              <td className="px-4 py-3 text-slate-900">Total</td>
              <td className="px-4 py-3 text-right text-emerald-600">
                {calc.formatCurrency(calc.yearToDateIncome(budget, 11))}
              </td>
              <td className="px-4 py-3 text-right text-red-500">
                {calc.formatCurrency(calc.yearToDateExpenses(budget, 11))}
              </td>
              <td className="px-4 py-3 text-right text-slate-500">
                {calc.formatCurrency(totalBudgeted * 12)}
              </td>
              <td className={`px-4 py-3 text-right ${calc.yearToDateIncome(budget, 11) - calc.yearToDateExpenses(budget, 11) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {calc.formatCurrency(calc.yearToDateIncome(budget, 11) - calc.yearToDateExpenses(budget, 11))}
              </td>
              <td className="px-4 py-3" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
