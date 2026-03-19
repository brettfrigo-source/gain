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

  // Goal form state
  const [gName, setGName] = useState("");
  const [gTarget, setGTarget] = useState("");
  const [gCurrent, setGCurrent] = useState("");
  const [gDeadline, setGDeadline] = useState("");
  const [gType, setGType] = useState<"short-term" | "long-term">("short-term");

  // Emergency fund form state
  const [efTarget, setEfTarget] = useState(budget.emergencyFund.targetMonths.toString());
  const [efCurrent, setEfCurrent] = useState(budget.emergencyFund.currentAmount.toString());
  const [efMonthly, setEfMonthly] = useState(budget.emergencyFund.monthlyExpenseEstimate.toString());

  const ef = budget.emergencyFund;
  const efGoal = ef.targetMonths * ef.monthlyExpenseEstimate;

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
    <div className="space-y-6">
      {/* Emergency Fund */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Emergency Fund</h2>
            <p className="text-sm text-slate-500">
              {ef.targetMonths} months of expenses ({calc.formatCurrency(efGoal)})
            </p>
          </div>
          <button
            onClick={() => setShowEfForm(true)}
            className="text-sm text-indigo-500 hover:text-indigo-700"
          >
            Edit
          </button>
        </div>
        <ProgressBar value={ef.currentAmount} max={efGoal} color="#10b981" size="lg" />
        <p className="text-sm text-slate-500 mt-2">
          {efGoal > 0 ? ((ef.currentAmount / efGoal) * 100).toFixed(0) : 0}% funded
          {ef.currentAmount < efGoal && (
            <span> — {calc.formatCurrency(efGoal - ef.currentAmount)} to go</span>
          )}
        </p>
      </div>

      {/* Savings Goals */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Savings Goals</h2>
        <button
          onClick={() => openGoalForm()}
          className="px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600"
        >
          + Add Goal
        </button>
      </div>

      {budget.savingsGoals.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-slate-400 text-sm">No savings goals yet. Add one to start tracking!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {budget.savingsGoals.map((goal) => {
            const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            return (
              <div key={goal.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{goal.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      goal.type === "short-term"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {goal.type === "short-term" ? "Short-term" : "Long-term"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openGoalForm(goal)} className="text-xs text-indigo-500 hover:text-indigo-700">Edit</button>
                    <button onClick={() => deleteSavingsGoal(goal.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                  </div>
                </div>
                <ProgressBar
                  value={goal.currentAmount}
                  max={goal.targetAmount}
                  color={goal.type === "short-term" ? "#3b82f6" : "#8b5cf6"}
                  size="md"
                />
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>{pct.toFixed(0)}% complete</span>
                  {goal.deadline && <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Form Modal */}
      <Modal open={showGoalForm} onClose={() => setShowGoalForm(false)} title={editing ? "Edit Goal" : "Add Savings Goal"}>
        <form onSubmit={handleGoalSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Goal Name</label>
            <input type="text" value={gName} onChange={(e) => setGName(e.target.value)} placeholder="e.g., Vacation fund" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Amount</label>
              <input type="number" value={gTarget} onChange={(e) => setGTarget(e.target.value)} placeholder="10000" min="0" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Amount</label>
              <input type="number" value={gCurrent} onChange={(e) => setGCurrent(e.target.value)} placeholder="0" min="0" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
              <input type="date" value={gDeadline} onChange={(e) => setGDeadline(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select value={gType} onChange={(e) => setGType(e.target.value as "short-term" | "long-term")} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                <option value="short-term">Short-term</option>
                <option value="long-term">Long-term</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600">
            {editing ? "Update" : "Add"} Goal
          </button>
        </form>
      </Modal>

      {/* Emergency Fund Form Modal */}
      <Modal open={showEfForm} onClose={() => setShowEfForm(false)} title="Edit Emergency Fund">
        <form onSubmit={handleEfSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Months</label>
            <input type="number" value={efTarget} onChange={(e) => setEfTarget(e.target.value)} min="1" max="24" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Amount Saved</label>
            <input type="number" value={efCurrent} onChange={(e) => setEfCurrent(e.target.value)} min="0" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Expense Estimate</label>
            <input type="number" value={efMonthly} onChange={(e) => setEfMonthly(e.target.value)} min="0" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <button type="submit" className="w-full py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600">
            Update Emergency Fund
          </button>
        </form>
      </Modal>
    </div>
  );
}
