import { BudgetYear, Category, MonthBudget } from "@/types";

let _counter = 0;
export function generateId(): string {
  _counter++;
  return `${Date.now()}-${_counter}-${Math.random().toString(36).slice(2, 9)}`;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-rent", name: "Rent/Housing", color: "#6366f1", budgetedMonthly: 1500, type: "need" },
  { id: "cat-utilities", name: "Utilities", color: "#8b5cf6", budgetedMonthly: 200, type: "need" },
  { id: "cat-groceries", name: "Groceries", color: "#22c55e", budgetedMonthly: 400, type: "need" },
  { id: "cat-transport", name: "Transportation", color: "#f59e0b", budgetedMonthly: 150, type: "need" },
  { id: "cat-healthcare", name: "Healthcare", color: "#ef4444", budgetedMonthly: 100, type: "need" },
  { id: "cat-insurance", name: "Insurance", color: "#64748b", budgetedMonthly: 200, type: "need" },
  { id: "cat-dining", name: "Dining Out", color: "#f97316", budgetedMonthly: 200, type: "want" },
  { id: "cat-entertainment", name: "Entertainment", color: "#ec4899", budgetedMonthly: 100, type: "want" },
  { id: "cat-subscriptions", name: "Subscriptions", color: "#14b8a6", budgetedMonthly: 50, type: "want" },
  { id: "cat-shopping", name: "Shopping", color: "#a855f7", budgetedMonthly: 150, type: "want" },
  { id: "cat-travel", name: "Travel", color: "#06b6d4", budgetedMonthly: 200, type: "want" },
  { id: "cat-personal", name: "Personal", color: "#84cc16", budgetedMonthly: 100, type: "want" },
  { id: "cat-savings", name: "Savings", color: "#10b981", budgetedMonthly: 500, type: "saving" },
];

function createEmptyMonth(month: number): MonthBudget {
  return { month, incomes: [], expenses: [] };
}

export function createDefaultBudgetYear(year: number): BudgetYear {
  return {
    id: generateId(),
    year,
    months: Array.from({ length: 12 }, (_, i) => createEmptyMonth(i)),
    savingsGoals: [],
    emergencyFund: {
      targetMonths: 6,
      currentAmount: 0,
      monthlyExpenseEstimate: 3000,
    },
    categories: [...DEFAULT_CATEGORIES],
    scenarios: [],
  };
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
