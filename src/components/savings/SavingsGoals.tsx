"use client";
import { useState } from "react";
import { useBudgetContext } from "@/hooks/useBudget";
import { SavingsGoal } from "@/types";
import * as calc from "@/lib/calculations";
import Modal from "../ui/Modal";
import ProgressBar from "../ui/ProgressBar";

export default function SavingsGoals() {
  const { budget, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, updateEmergencyFund } =
    useBudgetContext();
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showEfForm, setShowEfForm] = useState(false);
  const [editing, setEditing] = useState<SavingsGoal | null>(null);

  const [gName, setGName] = useState("");
  const [gTarget, setGTarget] = useState("");
  const [gCurrent, setGCurrent] = useState("");
  const [gDeadline, setGDeadline] = useState("");
  const [gType, setGType] = useState<"short-term" | "long-term">("short-term");

  const [efTarget, setEfTarget] = useState(budget.emergencyFund.targetMonths.toString());
  const [efCurrent, setEfCurrent] = useState(budget.emergencyFund.currentAmount.toString());
  const [efMonthly, setEfMonthly] = useState(budget.emergencyFund.monthlyExpenseEstimate.toString());

  const ef = budget.emergencyFund;
  const efGoal = ef.targetMonths * ef.monthlyExpenseEstimate;
  const efPct = efGoal > 0 ? Math.round((ef.currentAmount / efGoal) * 100) : 0;

  const openGoalForm = (goal?: SavingsGoal) => {
    if (goal) {
      setEditing(goal);
      setGName(goal.name);
      setGTarget(goal.targetAmount.toString());
      setGCurrent(goal.currentAmount.toString());
      setGDeadline(goal.deadline);
      setGType(goal.type);
    } else {
      setEditing(null);
      setGName("");
      setGTarget("");
      setGCurrent("");
      setGDeadline("");
      setGType("short-term");
    }
    setShowGoalForm(true);
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(gTarget) || 0;
    const current = parseFloat(gCurrent) || 0;
    if (!gName.trim() || target <= 0) return;
    const data = { name: gName.trim(), targetAmount: target, currentAmount: current, deadline: gDeadline, type: gType };
    if (editing) updateSavingsGoal({ ...editing, ...data });
    else addSavingsGoal(data);
    setShowGoalForm(false);
  };

  const handleEfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmergencyFund({
      targetMonths: parseFloat(efTarget) || 6,
      currentAmount: parseFloat(efCurrent) || 0,
      monthlyExpenseEstimate: parseFloat(efMonthly) || 3000,
    });
    setShowEfForm(false);
  };

  return (
    <div className="space-y-16">
      {/* Emergency Fund */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="section-title mb-2">Emergency fund</h1>
            <p className="section-subtitle">
              {ef.targetMonths} months of expenses · {calc.formatCurrency(efGoal)} target
            </p>
          </div>
          <button onClick={() => setShowEfForm(true)} className="btn-secondary">Edit</button>
        </div>
        <div className="card">
          <div className="flex items-end justify-between mb-4">
            <p className="text-4xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>
              {efPct}%
            </p>
            <p className="text-sm" style={{ color: "var(--fg-tertiary)" }}>
              {calc.formatCurrency(ef.currentAmount)} saved
              {ef.currentAmount < efGoal && ` · ${calc.formatCurrency(efGoal - ef.currentAmount)} to go`}
            </p>
          </div>
          <ProgressBar value={ef.currentAmount} max={efGoal} color="var(--success)" size="lg" />
        </div>
      </section>

      {/* Savings Goals */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <h2 className="section-title">Goals</h2>
          <button onClick={() => openGoalForm()} className="btn-primary">Add goal</button>
        </div>

        {budget.savingsGoals.length === 0 ? (
          <div className="card text-center py-16">
            <p style={{ color: "var(--fg-tertiary)" }}>No goals yet. Create one to start tracking.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {budget.savingsGoals.map((goal) => {
              const pct = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
              return (
                <div key={goal.id} className="card group">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-base font-semibold" style={{ color: "var(--fg)" }}>{goal.name}</h3>
                      <p className="text-xs mt-1" style={{ color: "var(--fg-tertiary)" }}>
                        {goal.type === "short-term" ? "Short-term" : "Long-term"}
                        {goal.deadline && ` · Due ${new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={() => openGoalForm(goal)} className="btn-ghost text-xs px-2 py-1">Edit</button>
                      <button onClick={() => deleteSavingsGoal(goal.id)} className="btn-ghost text-xs px-2 py-1 hover:!text-[var(--danger)]">Remove</button>
                    </div>
                  </div>
                  <div className="flex items-end justify-between mb-3">
                    <span className="text-2xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>{pct}%</span>
                    <span className="text-xs tabular-nums" style={{ color: "var(--fg-tertiary)" }}>
                      {calc.formatCurrency(goal.currentAmount)} / {calc.formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  <ProgressBar
                    value={goal.currentAmount}
                    max={goal.targetAmount}
                    color={goal.type === "short-term" ? "var(--accent)" : "#af52de"}
                    size="md"
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Goal Form */}
      <Modal open={showGoalForm} onClose={() => setShowGoalForm(false)} title={editing ? "Edit goal" : "New goal"}>
        <form onSubmit={handleGoalSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>Name</label>
            <input type="text" value={gName} onChange={(e) => setGName(e.target.value)} placeholder="Vacation, car, etc." className="input-field" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>Target</label>
              <input type="number" value={gTarget} onChange={(e) => setGTarget(e.target.value)} placeholder="10000" min="0" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>Saved so far</label>
              <input type="number" value={gCurrent} onChange={(e) => setGCurrent(e.target.value)} placeholder="0" min="0" className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>Deadline</label>
              <input type="date" value={gDeadline} onChange={(e) => setGDeadline(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>Type</label>
              <select value={gType} onChange={(e) => setGType(e.target.value as "short-term" | "long-term")} className="input-field">
                <option value="short-term">Short-term</option>
                <option value="long-term">Long-term</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full mt-2">{editing ? "Save changes" : "Add goal"}</button>
        </form>
      </Modal>

      {/* Emergency Fund Form */}
      <Modal open={showEfForm} onClose={() => setShowEfForm(false)} title="Emergency fund">
        <form onSubmit={handleEfSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>Target months</label>
            <input type="number" value={efTarget} onChange={(e) => setEfTarget(e.target.value)} min="1" max="24" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>Amount saved</label>
            <input type="number" value={efCurrent} onChange={(e) => setEfCurrent(e.target.value)} min="0" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>Monthly expenses estimate</label>
            <input type="number" value={efMonthly} onChange={(e) => setEfMonthly(e.target.value)} min="0" className="input-field" />
          </div>
          <button type="submit" className="btn-primary w-full mt-2">Save changes</button>
        </form>
      </Modal>
    </div>
  );
}
