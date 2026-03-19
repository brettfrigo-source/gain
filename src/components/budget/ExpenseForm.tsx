"use client";
import { useState } from "react";
import { useBudgetContext } from "@/hooks/useBudget";
import { Expense } from "@/types";
import { MONTH_NAMES } from "@/lib/defaults";

interface Props {
  month: number;
  existing: Expense | null;
  onDone: () => void;
}

export default function ExpenseForm({ month, existing, onDone }: Props) {
  const { budget, addExpense, updateExpense } = useBudgetContext();
  const [description, setDescription] = useState(existing?.description ?? "");
  const [amount, setAmount] = useState(existing?.amount?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? budget.categories[0]?.id ?? "");
  const [recurring, setRecurring] = useState(existing?.recurring ?? false);
  const [date, setDate] = useState(
    existing?.date ?? `${budget.year}-${String(month + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!description.trim() || isNaN(amt) || amt <= 0 || !categoryId) return;

    if (existing) {
      updateExpense(month, {
        ...existing,
        description: description.trim(),
        amount: amt,
        categoryId,
        recurring,
        date,
      });
    } else {
      addExpense(month, {
        description: description.trim(),
        amount: amt,
        categoryId,
        recurring,
        date,
      });
    }
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Monthly rent"
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
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
        >
          {budget.categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
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
        {existing ? "Update" : "Add"} Expense
      </button>
    </form>
  );
}
