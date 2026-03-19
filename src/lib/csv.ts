import Papa from "papaparse";
import { BudgetYear, Expense } from "@/types";
import { generateId } from "./defaults";
import { getCategoryName } from "./calculations";

interface CsvExpenseRow {
  date: string;
  category: string;
  description: string;
  amount: string;
  recurring: string;
}

export function exportExpensesCsv(budget: BudgetYear): string {
  const rows: CsvExpenseRow[] = [];
  for (const month of budget.months) {
    for (const expense of month.expenses) {
      rows.push({
        date: expense.date,
        category: getCategoryName(budget.categories, expense.categoryId),
        description: expense.description,
        amount: expense.amount.toFixed(2),
        recurring: expense.recurring ? "yes" : "no",
      });
    }
  }
  return Papa.unparse(rows);
}

export function importExpensesCsv(
  csvText: string,
  budget: BudgetYear
): { expenses: Expense[]; unmatchedCategories: string[] } {
  const result = Papa.parse<CsvExpenseRow>(csvText, { header: true, skipEmptyLines: true });
  const expenses: Expense[] = [];
  const unmatched = new Set<string>();

  const catMap = new Map(budget.categories.map((c) => [c.name.toLowerCase(), c.id]));

  for (const row of result.data) {
    const catName = (row.category || "").trim().toLowerCase();
    let categoryId = catMap.get(catName);
    if (!categoryId) {
      unmatched.add(row.category || "Unknown");
      categoryId = budget.categories[budget.categories.length - 1]?.id ?? "cat-personal";
    }

    const amount = parseFloat(row.amount);
    if (isNaN(amount)) continue;

    expenses.push({
      id: generateId(),
      categoryId,
      description: row.description || "",
      amount: Math.abs(amount),
      recurring: (row.recurring || "").toLowerCase() === "yes",
      date: row.date || new Date().toISOString().split("T")[0],
    });
  }

  return { expenses, unmatchedCategories: Array.from(unmatched) };
}

export function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
