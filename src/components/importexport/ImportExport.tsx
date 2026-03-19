"use client";
import { useState, useRef } from "react";
import { useBudgetContext } from "@/hooks/useBudget";
import { exportExpensesCsv, importExpensesCsv, downloadCsv } from "@/lib/csv";
import * as calc from "@/lib/calculations";

export default function ImportExport() {
  const { budget, addExpenses } = useBudgetContext();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = () => {
    const csv = exportExpensesCsv(budget);
    downloadCsv(csv, `gain-expenses-${budget.year}.csv`);
  };

  const handleExportSummary = () => {
    const rows = budget.months.map((m, i) => ({
      month: calc.getCategoryName([], "") || ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
      income: calc.totalIncome(budget, i).toFixed(2),
      expenses: calc.totalExpenses(budget, i).toFixed(2),
      net: calc.netSavings(budget, i).toFixed(2),
    }));
    const header = "month,income,expenses,net";
    const body = rows.map(r => `${r.month},${r.income},${r.expenses},${r.net}`).join("\n");
    downloadCsv(`${header}\n${body}`, `gain-summary-${budget.year}.csv`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { expenses, unmatchedCategories } = importExpensesCsv(text, budget);
      if (expenses.length > 0) {
        addExpenses(expenses);
        let msg = `Imported ${expenses.length} expense(s)`;
        if (unmatchedCategories.length > 0) {
          msg += `. Unmatched categories: ${unmatchedCategories.join(", ")} (assigned to last category)`;
        }
        setImportStatus(msg);
      } else {
        setImportStatus("No valid expenses found in file");
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const totalExpenses = budget.months.reduce((s, m) => s + m.expenses.length, 0);
  const totalIncomes = budget.months.reduce((s, m) => s + m.incomes.length, 0);

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-lg font-semibold text-slate-900">Import & Export</h2>

      {/* Data summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Current Data ({budget.year})</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Total income entries:</span>{" "}
            <span className="font-medium">{totalIncomes}</span>
          </div>
          <div>
            <span className="text-slate-500">Total expense entries:</span>{" "}
            <span className="font-medium">{totalExpenses}</span>
          </div>
          <div>
            <span className="text-slate-500">Categories:</span>{" "}
            <span className="font-medium">{budget.categories.length}</span>
          </div>
          <div>
            <span className="text-slate-500">Savings goals:</span>{" "}
            <span className="font-medium">{budget.savingsGoals.length}</span>
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Export Data</h3>
        <p className="text-sm text-slate-500 mb-4">Download your budget data as CSV files.</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600"
          >
            Export Expenses (CSV)
          </button>
          <button
            onClick={handleExportSummary}
            className="px-4 py-2 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200 border border-slate-200"
          >
            Export Monthly Summary (CSV)
          </button>
        </div>
      </div>

      {/* Import */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Import Expenses</h3>
        <p className="text-sm text-slate-500 mb-2">
          Upload a CSV file with columns: <code className="text-xs bg-slate-100 px-1 rounded">date, category, description, amount, recurring</code>
        </p>
        <p className="text-xs text-slate-400 mb-4">
          Category names are matched to existing categories (case-insensitive). Unmatched categories will be assigned to the last category.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleImport}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {importStatus && (
          <p className="mt-3 text-sm text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">
            {importStatus}
          </p>
        )}
      </div>

      {/* CSV Template */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">CSV Template</h3>
        <pre className="text-xs bg-slate-50 p-3 rounded-lg overflow-x-auto text-slate-600">
{`date,category,description,amount,recurring
2026-01-15,Groceries,Weekly groceries,120.50,no
2026-01-01,Rent/Housing,Monthly rent,1500,yes
2026-01-10,Entertainment,Movie tickets,35,no
2026-01-05,Subscriptions,Netflix,15.99,yes`}
        </pre>
      </div>
    </div>
  );
}
