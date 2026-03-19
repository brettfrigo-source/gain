"use client";
import { useState } from "react";
import { useBudgetContext } from "@/hooks/useBudget";
import { IncomeEntry } from "@/types";

interface Props {
  month: number;
  existing: IncomeEntry | null;
  onDone: () => void;
}

export default function IncomeForm({ month, existing, onDone }: Props) {
  const { addIncome, updateIncome } = useBudgetContext();
  const [source, setSource] = useState(existing?.source ?? "");
  const [amount, setAmount] = useState(existing?.amount?.toString() ?? "");
  const [recurring, setRecurring] = useState(existing?.recurring ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!source.trim() || isNaN(amt) || amt <= 0) return;

    if (existing) {
      updateIncome(month, { ...existing, source: source.trim(), amount: amt, recurring });
    } else {
      addIncome(month, { source: source.trim(), amount: amt, recurring });
    }
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="e.g., Salary, Freelance"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={recurring}
          onChange={(e) => setRecurring(e.target.checked)}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        Recurring monthly
      </label>
      <button
        type="submit"
        className="w-full py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600"
      >
        {existing ? "Update" : "Add"} Income
      </button>
    </form>
  );
}
