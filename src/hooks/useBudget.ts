"use client";
import { createContext, useContext } from "react";
import {
  BudgetYear,
  Category,
  Expense,
  IncomeEntry,
  SavingsGoal,
  EmergencyFund,
  Scenario,
} from "@/types";
import { useLocalStorage } from "./useLocalStorage";
import { createDefaultBudgetYear, generateId } from "@/lib/defaults";

export interface BudgetContextType {
  budget: BudgetYear;
  year: number;
  setYear: (y: number) => void;

  // Categories
  addCategory: (cat: Omit<Category, "id">) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;

  // Income
  addIncome: (month: number, income: Omit<IncomeEntry, "id">) => void;
  updateIncome: (month: number, income: IncomeEntry) => void;
  deleteIncome: (month: number, id: string) => void;

  // Expenses
  addExpense: (month: number, expense: Omit<Expense, "id">) => void;
  updateExpense: (month: number, expense: Expense) => void;
  deleteExpense: (month: number, id: string) => void;
  addExpenses: (expenses: Expense[]) => void;

  // Savings Goals
  addSavingsGoal: (goal: Omit<SavingsGoal, "id">) => void;
  updateSavingsGoal: (goal: SavingsGoal) => void;
  deleteSavingsGoal: (id: string) => void;

  // Emergency Fund
  updateEmergencyFund: (fund: EmergencyFund) => void;

  // Scenarios
  addScenario: (scenario: Omit<Scenario, "id">) => void;
  updateScenario: (scenario: Scenario) => void;
  deleteScenario: (id: string) => void;

  // Bulk
  setBudget: (b: BudgetYear) => void;
}

export const BudgetContext = createContext<BudgetContextType | null>(null);

export function useBudgetContext(): BudgetContextType {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error("useBudgetContext must be used within BudgetProvider");
  return ctx;
}

export function useBudgetState(initialYear: number) {
  const [year, setYear] = useLocalStorage<number>("gain-current-year", initialYear);
  const [budget, setBudget] = useLocalStorage<BudgetYear>(
    `gain-budget-${year}`,
    createDefaultBudgetYear(year)
  );

  const update = (fn: (b: BudgetYear) => BudgetYear) => setBudget(fn);

  const addCategory = (cat: Omit<Category, "id">) =>
    update((b) => ({ ...b, categories: [...b.categories, { ...cat, id: generateId() }] }));

  const updateCategory = (cat: Category) =>
    update((b) => ({ ...b, categories: b.categories.map((c) => (c.id === cat.id ? cat : c)) }));

  const deleteCategory = (id: string) =>
    update((b) => ({ ...b, categories: b.categories.filter((c) => c.id !== id) }));

  const addIncome = (month: number, income: Omit<IncomeEntry, "id">) =>
    update((b) => ({
      ...b,
      months: b.months.map((m) =>
        m.month === month
          ? { ...m, incomes: [...m.incomes, { ...income, id: generateId() }] }
          : m
      ),
    }));

  const updateIncome = (month: number, income: IncomeEntry) =>
    update((b) => ({
      ...b,
      months: b.months.map((m) =>
        m.month === month
          ? { ...m, incomes: m.incomes.map((i) => (i.id === income.id ? income : i)) }
          : m
      ),
    }));

  const deleteIncome = (month: number, id: string) =>
    update((b) => ({
      ...b,
      months: b.months.map((m) =>
        m.month === month ? { ...m, incomes: m.incomes.filter((i) => i.id !== id) } : m
      ),
    }));

  const addExpense = (month: number, expense: Omit<Expense, "id">) =>
    update((b) => ({
      ...b,
      months: b.months.map((m) =>
        m.month === month
          ? { ...m, expenses: [...m.expenses, { ...expense, id: generateId() }] }
          : m
      ),
    }));

  const updateExpense = (month: number, expense: Expense) =>
    update((b) => ({
      ...b,
      months: b.months.map((m) =>
        m.month === month
          ? { ...m, expenses: m.expenses.map((e) => (e.id === expense.id ? expense : e)) }
          : m
      ),
    }));

  const deleteExpense = (month: number, id: string) =>
    update((b) => ({
      ...b,
      months: b.months.map((m) =>
        m.month === month ? { ...m, expenses: m.expenses.filter((e) => e.id !== id) } : m
      ),
    }));

  const addExpenses = (expenses: Expense[]) =>
    update((b) => {
      const newMonths = [...b.months.map((m) => ({ ...m, expenses: [...m.expenses] }))];
      for (const exp of expenses) {
        const d = new Date(exp.date);
        const m = d.getMonth();
        if (m >= 0 && m < 12) newMonths[m].expenses.push(exp);
      }
      return { ...b, months: newMonths };
    });

  const addSavingsGoal = (goal: Omit<SavingsGoal, "id">) =>
    update((b) => ({ ...b, savingsGoals: [...b.savingsGoals, { ...goal, id: generateId() }] }));

  const updateSavingsGoal = (goal: SavingsGoal) =>
    update((b) => ({
      ...b,
      savingsGoals: b.savingsGoals.map((g) => (g.id === goal.id ? goal : g)),
    }));

  const deleteSavingsGoal = (id: string) =>
    update((b) => ({ ...b, savingsGoals: b.savingsGoals.filter((g) => g.id !== id) }));

  const updateEmergencyFund = (fund: EmergencyFund) =>
    update((b) => ({ ...b, emergencyFund: fund }));

  const addScenario = (scenario: Omit<Scenario, "id">) =>
    update((b) => ({ ...b, scenarios: [...b.scenarios, { ...scenario, id: generateId() }] }));

  const updateScenario = (scenario: Scenario) =>
    update((b) => ({
      ...b,
      scenarios: b.scenarios.map((s) => (s.id === scenario.id ? scenario : s)),
    }));

  const deleteScenario = (id: string) =>
    update((b) => ({ ...b, scenarios: b.scenarios.filter((s) => s.id !== id) }));

  return {
    budget,
    year,
    setYear: (y: number) => {
      setYear(y);
    },
    addCategory,
    updateCategory,
    deleteCategory,
    addIncome,
    updateIncome,
    deleteIncome,
    addExpense,
    updateExpense,
    deleteExpense,
    addExpenses,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    updateEmergencyFund,
    addScenario,
    updateScenario,
    deleteScenario,
    setBudget,
  };
}
