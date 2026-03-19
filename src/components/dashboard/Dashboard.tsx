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
    }));
  }, [budget]);

  const categoryData = useMemo(() => {
    return budget.categories
      .map((cat) => ({
        name: cat.name,
        value: calc.categorySpend(budget, cat.id, currentMonth),
        color: cat.color,
      }))
      .filter((d) => d.value > 0);
  }, [budget, currentMonth]);

  const budgetVsActual = useMemo(() => {
    return budget.categories
      .map((cat) => ({
        name: cat.name.length > 10 ? cat.name.slice(0, 10) + "…" : cat.name,
        budgeted: cat.budgetedMonthly,
        actual: calc.categorySpend(budget, cat.id, currentMonth),
      }))
      .filter((d) => d.budgeted > 0 || d.actual > 0);
  }, [budget, currentMonth]);

  return (
    <div className="space-y-16">
      <SummaryCards currentMonth={currentMonth} />
      <AlertsBanner currentMonth={currentMonth} />

      <section>
        <h2 className="section-title mb-2">Spending trends</h2>
        <p className="section-subtitle mb-8">Income and expenses across the year</p>
        <div className="card">
          <SpendingTrendsChart data={monthlyData} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h3 className="text-lg font-semibold tracking-tight mb-4" style={{ color: "var(--fg)" }}>
            This month by category
          </h3>
          <div className="card">
            {categoryData.length > 0 ? (
              <CategoryPieChart data={categoryData} />
            ) : (
              <p className="text-center py-16" style={{ color: "var(--fg-tertiary)" }}>
                No expenses this month
              </p>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold tracking-tight mb-4" style={{ color: "var(--fg)" }}>
            Budget vs. actual
          </h3>
          <div className="card">
            <BudgetVsActualBar data={budgetVsActual} />
          </div>
        </section>
      </div>
    </div>
  );
}
