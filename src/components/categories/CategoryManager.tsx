"use client";
import { useState } from "react";
import { useBudgetContext } from "@/hooks/useBudget";
import { Category } from "@/types";
import * as calc from "@/lib/calculations";
import Modal from "../ui/Modal";
import ProgressBar from "../ui/ProgressBar";

const PRESET_COLORS = [
  "#ff3b30", "#ff9f0a", "#ffcc00", "#34c759", "#00c7be",
  "#30b0c7", "#0071e3", "#5856d6", "#af52de", "#ff2d55",
  "#a2845e", "#8e8e93",
];

export default function CategoryManager() {
  const { budget, addCategory, updateCategory, deleteCategory } = useBudgetContext();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[6]);
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

  const groups = [
    { key: "need" as const, label: "Needs" },
    { key: "want" as const, label: "Wants" },
    { key: "saving" as const, label: "Savings" },
  ];

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="section-title mb-2">Categories</h1>
          <p className="section-subtitle">
            Monthly budget: {calc.formatCurrency(totalBudgeted)}
          </p>
        </div>
        <button onClick={() => openForm()} className="btn-primary">
          Add category
        </button>
      </div>

      {groups.map(({ key, label }) => {
        const cats = budget.categories.filter((c) => c.type === key);
        if (cats.length === 0) return null;
        return (
          <section key={key}>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--fg-tertiary)" }}>
              {label}
            </h2>
            <div className="space-y-1">
              {cats.map((cat) => {
                const spent = calc.categorySpend(budget, cat.id, currentMonth);
                return (
                  <div
                    key={cat.id}
                    className="flex items-center gap-4 py-4 px-4 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors duration-200 group"
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>{cat.name}</span>
                        <span className="text-xs tabular-nums" style={{ color: "var(--fg-tertiary)" }}>
                          {calc.formatCurrency(spent)} / {calc.formatCurrency(cat.budgetedMonthly)}
                        </span>
                      </div>
                      <ProgressBar value={spent} max={cat.budgetedMonthly} color={cat.color} size="sm" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={() => openForm(cat)} className="btn-ghost text-xs px-2 py-1">Edit</button>
                      <button onClick={() => deleteCategory(cat.id)} className="btn-ghost text-xs px-2 py-1 hover:!text-[var(--danger)]">Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit category" : "New category"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="input-field" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>Monthly budget</label>
              <input type="number" value={budgetAmt} onChange={(e) => setBudgetAmt(e.target.value)} placeholder="0" min="0" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as Category["type"])} className="input-field">
                <option value="need">Need</option>
                <option value="want">Want</option>
                <option value="saving">Saving</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-3" style={{ color: "var(--fg-secondary)" }}>Color</label>
            <div className="flex flex-wrap gap-2.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-transform duration-200"
                  style={{
                    backgroundColor: c,
                    transform: color === c ? "scale(1.2)" : "scale(1)",
                    boxShadow: color === c ? `0 0 0 2px white, 0 0 0 3.5px ${c}` : "none",
                  }}
                />
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary w-full mt-2">
            {editing ? "Save changes" : "Add category"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
