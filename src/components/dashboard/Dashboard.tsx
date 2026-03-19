"use client";
import { useBudgetContext } from "@/hooks/useBudget";
import { useMemo } from "react";
import * as calc from "@/lib/calculations";
import { MONTH_SHORT } from "@/lib/defaults";
import SummaryCards from "./SummaryCards";
import AlertsBanner from "./AlertsBanner";
import SpendingTrendsChart from "./SpendingTrendsChart";
import CategoryPieChart from "./CategoryPieChart";
import BudgetVsActualBar from "./BudgetVsActualBar";

export default function Dashboard() {
  const { budget } = useBudgetContext();
  const currentMonth = new Date().getMonth();

  const monthlyData = useMemo(() => {
    return MONTH_SHORT.map((name, i) => ({
      name,
      income: calc.totalIncome(budget, i),
      expenses: calc.totalExpenses(budget, i),
      net: calc.netSavings(budget, i),
    }));
  }, [budget]);

  const categoryData = useMemo(() => {
    return budget.categories
      .map((cat) => ({
        name: cat.name,
        value: calc.categorySpend(budget, cat.id, currentMonth),
        color: cat.color,
        budget: cat.budgetedMonthly,
      }))
      .filter((d) => d.value > 0);
  }, [budget, currentMonth]);

  const budgetVsActual = useMemo(() => {
    return budget.categories.map((cat) => ({
      name: cat.name.length > 12 ? cat.name.slice(0, 12) + "..." : cat.name,
      budgeted: cat.budgetedMonthly,
      actual: calc.categorySpend(budget, cat.id, currentMonth),
      color: cat.color,
    }));
  }, [budget, currentMonth]);

  return (
    <div className="space-y-6">
      <SummaryCards currentMonth={currentMonth} />
      <AlertsBanner currentMonth={currentMonth} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Spending Trends</h3>
          <SpendingTrendsChart data={monthlyData} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Category Breakdown — {MONTH_SHORT[currentMonth]}
          </h3>
          {categoryData.length > 0 ? (
            <CategoryPieChart data={categoryData} />
          ) : (
            <p className="text-slate-400 text-sm py-12 text-center">No expenses this month</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">
          Budget vs Actual — {MONTH_SHORT[currentMonth]}
        </h3>
        <BudgetVsActualBar data={budgetVsActual} />
      </div>
    </div>
  );
}
