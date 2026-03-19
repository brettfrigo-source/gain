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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>Source</label>
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Salary, freelance, etc."
          className="input-field"
          autoFocus
        />
      </div>
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
        {existing ? "Save changes" : "Add income"}
      </button>
    </form>
  );
}
