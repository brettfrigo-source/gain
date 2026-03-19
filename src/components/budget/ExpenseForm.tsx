"use client";
import { useState } from "react";
import { useBudgetContext } from "@/hooks/useBudget";
import { Expense } from "@/types";

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
    existing?.date ??
      `${budget.year}-${String(month + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!description.trim() || isNaN(amt) || amt <= 0 || !categoryId) return;
    if (existing) {
      updateExpense(month, { ...existing, description: description.trim(), amount: amt, categoryId, recurring, date });
    } else {
      addExpense(month, { description: description.trim(), amount: amt, categoryId, recurring, date });
    }
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Monthly rent, groceries, etc."
          className="input-field"
          autoFocus
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            step="0.01"
            min="0"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="input-field"
        >
          {budget.categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={recurring}
          onChange={(e) => setRecurring(e.target.checked)}
          className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] focus:ring-offset-0"
        />
        <span className="text-sm" style={{ color: "var(--fg-secondary)" }}>Recurring monthly</span>
      </label>
      <button type="submit" className="btn-primary w-full mt-2">
        {existing ? "Save changes" : "Add expense"}
      </button>
    </form>
  );
}
