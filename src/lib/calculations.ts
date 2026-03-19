import { BudgetYear, Category, Scenario } from "@/types";

export function totalIncome(budget: BudgetYear, month: number): number {
  return budget.months[month].incomes.reduce((sum, i) => sum + i.amount, 0);
}

export function totalExpenses(budget: BudgetYear, month: number): number {
  return budget.months[month].expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function netSavings(budget: BudgetYear, month: number): number {
  return totalIncome(budget, month) - totalExpenses(budget, month);
}

export function categorySpend(budget: BudgetYear, categoryId: string, month: number): number {
  return budget.months[month].expenses
    .filter((e) => e.categoryId === categoryId)
    .reduce((sum, e) => sum + e.amount, 0);
}

export function yearToDateIncome(budget: BudgetYear, upToMonth: number): number {
  let total = 0;
  for (let m = 0; m <= upToMonth; m++) total += totalIncome(budget, m);
  return total;
}

export function yearToDateExpenses(budget: BudgetYear, upToMonth: number): number {
  let total = 0;
  for (let m = 0; m <= upToMonth; m++) total += totalExpenses(budget, m);
  return total;
}

export function averageMonthlyIncome(budget: BudgetYear, upToMonth: number): number {
  const months = upToMonth + 1;
  return months > 0 ? yearToDateIncome(budget, upToMonth) / months : 0;
}

export function averageMonthlyExpenses(budget: BudgetYear, upToMonth: number): number {
  const months = upToMonth + 1;
  return months > 0 ? yearToDateExpenses(budget, upToMonth) / months : 0;
}

export function forecastEndOfYear(budget: BudgetYear, currentMonth: number): number {
  const avgIncome = averageMonthlyIncome(budget, currentMonth);
  const avgExpenses = averageMonthlyExpenses(budget, currentMonth);
  const ytdNet = yearToDateIncome(budget, currentMonth) - yearToDateExpenses(budget, currentMonth);
  const remainingMonths = 11 - currentMonth;
  return ytdNet + remainingMonths * (avgIncome - avgExpenses);
}

export function monthlyForecast(budget: BudgetYear, currentMonth: number): number[] {
  const avgIncome = averageMonthlyIncome(budget, currentMonth);
  const avgExpenses = averageMonthlyExpenses(budget, currentMonth);
  const results: number[] = [];
  let runningBalance = 0;

  for (let m = 0; m < 12; m++) {
    if (m <= currentMonth) {
      runningBalance += netSavings(budget, m);
    } else {
      runningBalance += avgIncome - avgExpenses;
    }
    results.push(runningBalance);
  }
  return results;
}

export function scenarioForecast(
  budget: BudgetYear,
  scenario: Scenario,
  currentMonth: number
): number[] {
  const avgIncome = averageMonthlyIncome(budget, currentMonth) + scenario.incomeAdjustment;
  const adjustmentMap = new Map(scenario.adjustments.map((a) => [a.categoryId, a.newMonthlyAmount]));

  let projectedExpenses = 0;
  for (const cat of budget.categories) {
    projectedExpenses += adjustmentMap.get(cat.id) ?? cat.budgetedMonthly;
  }

  const results: number[] = [];
  let runningBalance = 0;
  for (let m = 0; m < 12; m++) {
    if (m <= currentMonth) {
      runningBalance += netSavings(budget, m);
    } else {
      runningBalance += avgIncome - projectedExpenses;
    }
    results.push(runningBalance);
  }
  return results;
}

export interface Alert {
  type: "overspend" | "warning" | "info" | "success";
  message: string;
  suggestion?: string;
}

export function getAlerts(budget: BudgetYear, currentMonth: number): Alert[] {
  const alerts: Alert[] = [];

  // Check category overspending for current month
  for (const cat of budget.categories) {
    const spent = categorySpend(budget, cat.id, currentMonth);
    const ratio = cat.budgetedMonthly > 0 ? spent / cat.budgetedMonthly : 0;
    if (ratio > 1) {
      const over = spent - cat.budgetedMonthly;
      alerts.push({
        type: "overspend",
        message: `${cat.name} is $${over.toFixed(0)} over budget this month`,
        suggestion: `Reduce ${cat.name.toLowerCase()} spending by $${over.toFixed(0)} to stay on track`,
      });
    } else if (ratio > 0.8) {
      alerts.push({
        type: "warning",
        message: `${cat.name} is at ${(ratio * 100).toFixed(0)}% of monthly budget`,
      });
    }
  }

  // Monthly deficit
  const net = netSavings(budget, currentMonth);
  if (net < 0) {
    alerts.push({
      type: "overspend",
      message: `You're spending $${Math.abs(net).toFixed(0)} more than you earn this month`,
      suggestion: "Review your largest expense categories for potential cuts",
    });
  }

  // Emergency fund
  const ef = budget.emergencyFund;
  const efTarget = ef.targetMonths * ef.monthlyExpenseEstimate;
  if (ef.currentAmount < efTarget * 0.5) {
    alerts.push({
      type: "warning",
      message: `Emergency fund is below 50% of target ($${ef.currentAmount.toFixed(0)} / $${efTarget.toFixed(0)})`,
    });
  }

  // Savings goals at risk
  for (const goal of budget.savingsGoals) {
    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining > 0 && goal.deadline) {
      const deadline = new Date(goal.deadline);
      const now = new Date();
      const monthsLeft = (deadline.getFullYear() - now.getFullYear()) * 12 + deadline.getMonth() - now.getMonth();
      if (monthsLeft > 0) {
        const neededPerMonth = remaining / monthsLeft;
        const avgNet = averageMonthlyIncome(budget, currentMonth) - averageMonthlyExpenses(budget, currentMonth);
        if (neededPerMonth > avgNet * 0.5) {
          alerts.push({
            type: "warning",
            message: `"${goal.name}" needs $${neededPerMonth.toFixed(0)}/month to hit target by deadline`,
            suggestion: `You need to save $${neededPerMonth.toFixed(0)}/month for "${goal.name}"`,
          });
        }
      }
    }
  }

  if (alerts.length === 0 && totalIncome(budget, currentMonth) > 0) {
    alerts.push({ type: "success", message: "All spending is within budget. Keep it up!" });
  }

  return alerts;
}

export function getCategoryColor(categories: Category[], categoryId: string): string {
  return categories.find((c) => c.id === categoryId)?.color ?? "#94a3b8";
}

export function getCategoryName(categories: Category[], categoryId: string): string {
  return categories.find((c) => c.id === categoryId)?.name ?? "Unknown";
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
