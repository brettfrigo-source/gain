"use client";
import { useState } from "react";
import { useBudgetContext } from "@/hooks/useBudget";
import { Category } from "@/types";
import * as calc from "@/lib/calculations";
import Modal from "../ui/Modal";
import ProgressBar from "../ui/ProgressBar";

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#ef4444",
  "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#14b8a6",
  "#06b6d4", "#3b82f6", "#64748b",
];

export default function CategoryManager() {
  const { budget, addCategory, updateCategory, deleteCategory } = useBudgetContext();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [budgetAmt, setBudgetAmt] = useState("");
  const [type, setType] = useState<Category["type"]>("want");

  const currentMonth = new Date().getMonth();
  const totalBudgeted = budget.categories.reduce((s, c) => s + c.budgetedMonthly, 0);

  const openForm = (cat?: Category) => {
    if (cat) {
      setEditing(cat);
      setName(cat.name);
      setColor(cat.color);
      setBudgetAmt(cat.budgetedMonthly.toString());
      setType(cat.type);
    } else {
      setEditing(null);
      setName("");
      setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
      setBudgetAmt("");
      setType("want");
    }
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(budgetAmt) || 0;
    if (!name.trim()) return;
    if (editing) {
      updateCategory({ ...editing, name: name.trim(), color, budgetedMonthly: amt, type });
    } else {
      addCategory({ name: name.trim(), color, budgetedMonthly: amt, type });
    }
    setShowForm(false);
  };

  const grouped = {
    need: budget.categories.filter((c) => c.type === "need"),
    want: budget.categories.filter((c) => c.type === "want"),
    saving: budget.categories.filter((c) => c.type === "saving"),
  };

  const renderGroup = (label: string, cats: Category[]) => (
    <div key={label}>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</h3>
      <div className="space-y-2">
        {cats.map((cat) => {
          const spent = calc.categorySpend(budget, cat.id, currentMonth);
          return (
            <div
              key={cat.id}
              className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm font-medium text-slate-900">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    {calc.formatCurrency(spent)} / {calc.formatCurrency(cat.budgetedMonthly)}
                  </span>
                  <button
                    onClick={() => openForm(cat)}
                    className="text-xs text-indigo-500 hover:text-indigo-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <ProgressBar value={spent} max={cat.budgetedMonthly} color={cat.color} showLabel={false} size="sm" />
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Categories</h2>
          <p className="text-sm text-slate-500">
            Total monthly budget: {calc.formatCurrency(totalBudgeted)}
          </p>
        </div>
        <button
          onClick={() => openForm()}
          className="px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600"
        >
          + Add Category
        </button>
      </div>

      <div className="space-y-6">
        {renderGroup("Needs", grouped.need)}
        {renderGroup("Wants", grouped.want)}
        {renderGroup("Savings", grouped.saving)}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit Category" : "Add Category"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Budget</label>
            <input
              type="number"
              value={budgetAmt}
              onChange={(e) => setBudgetAmt(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Category["type"])}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
            >
              <option value="need">Need</option>
              <option value="want">Want</option>
              <option value="saving">Saving</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    color === c ? "border-slate-900 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600"
          >
            {editing ? "Update" : "Add"} Category
          </button>
        </form>
      </Modal>
    </div>
  );
}
