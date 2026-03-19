"use client";
import { useState, useRef } from "react";
import { useBudgetContext } from "@/hooks/useBudget";
import { exportExpensesCsv, importExpensesCsv, downloadCsv } from "@/lib/csv";

export default function ImportExport() {
  const { budget, addExpenses } = useBudgetContext();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = () => {
    const csv = exportExpensesCsv(budget);
    downloadCsv(csv, `gain-expenses-${budget.year}.csv`);
  };

  const handleExportSummary = () => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const header = "month,income,expenses,net";
    const rows = budget.months.map((_, i) => {
      const inc = budget.months[i].incomes.reduce((s, x) => s + x.amount, 0);
      const exp = budget.months[i].expenses.reduce((s, x) => s + x.amount, 0);
      return `${months[i]},${inc.toFixed(2)},${exp.toFixed(2)},${(inc - exp).toFixed(2)}`;
    });
    downloadCsv(`${header}\n${rows.join("\n")}`, `gain-summary-${budget.year}.csv`);
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
        let msg = `${expenses.length} expense${expenses.length > 1 ? "s" : ""} imported`;
        if (unmatchedCategories.length > 0) {
          msg += `. Unmatched: ${unmatchedCategories.join(", ")}`;
        }
        setImportStatus(msg);
      } else {
        setImportStatus("No valid expenses found");
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const totalExpenses = budget.months.reduce((s, m) => s + m.expenses.length, 0);
  const totalIncomes = budget.months.reduce((s, m) => s + m.incomes.length, 0);

  return (
    <div className="max-w-xl space-y-16">
      <div>
        <h1 className="section-title mb-2">Data</h1>
        <p className="section-subtitle">Import and export your {budget.year} budget.</p>
      </div>

      {/* Summary */}
      <section className="card" style={{ background: "var(--bg-secondary)" }}>
        <div className="grid grid-cols-2 gap-6">
          {[
            { label: "Income entries", value: totalIncomes },
            { label: "Expense entries", value: totalExpenses },
            { label: "Categories", value: budget.categories.length },
            { label: "Savings goals", value: budget.savingsGoals.length },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs" style={{ color: "var(--fg-tertiary)" }}>{item.label}</p>
              <p className="text-lg font-semibold mt-0.5" style={{ color: "var(--fg)" }}>{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Export */}
      <section>
        <h2 className="text-lg font-semibold tracking-tight mb-2" style={{ color: "var(--fg)" }}>Export</h2>
        <p className="text-sm mb-6" style={{ color: "var(--fg-secondary)" }}>Download your data as CSV.</p>
        <div className="flex gap-3">
          <button onClick={handleExport} className="btn-primary">Export expenses</button>
          <button onClick={handleExportSummary} className="btn-secondary">Export summary</button>
        </div>
      </section>

      {/* Import */}
      <section>
        <h2 className="text-lg font-semibold tracking-tight mb-2" style={{ color: "var(--fg)" }}>Import</h2>
        <p className="text-sm mb-6" style={{ color: "var(--fg-secondary)" }}>
          Upload a CSV with columns: date, category, description, amount, recurring
        </p>
        <label className="block cursor-pointer">
          <div
            className="card text-center py-10 transition-all duration-200 hover:shadow-lg hover:shadow-black/[0.03]"
            style={{ border: "1.5px dashed var(--border)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>Choose file</p>
            <p className="text-xs mt-1" style={{ color: "var(--fg-tertiary)" }}>CSV files only</p>
          </div>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
        </label>
        {importStatus && (
          <p className="mt-4 text-sm font-medium px-4 py-3 rounded-xl" style={{ background: "rgba(0,113,227,0.06)", color: "var(--accent)" }}>
            {importStatus}
          </p>
        )}
      </section>

      {/* Template */}
      <section>
        <h2 className="text-lg font-semibold tracking-tight mb-4" style={{ color: "var(--fg)" }}>CSV template</h2>
        <pre className="text-xs leading-relaxed p-5 rounded-xl overflow-x-auto" style={{ background: "var(--bg-secondary)", color: "var(--fg-secondary)" }}>
{`date,category,description,amount,recurring
2026-01-15,Groceries,Weekly groceries,120.50,no
2026-01-01,Rent/Housing,Monthly rent,1500,yes
2026-01-10,Entertainment,Movie tickets,35,no`}
        </pre>
      </section>
    </div>
  );
}
