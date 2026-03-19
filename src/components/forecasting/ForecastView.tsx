"use client";
import { useState, useMemo } from "react";
import { useBudgetContext } from "@/hooks/useBudget";
import { Scenario } from "@/types";
import * as calc from "@/lib/calculations";
import { MONTH_SHORT, generateId } from "@/lib/defaults";
import Modal from "../ui/Modal";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const SCENARIO_COLORS = ["#f97316", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

export default function ForecastView() {
  const { budget, addScenario, updateScenario, deleteScenario } = useBudgetContext();
  const currentMonth = new Date().getMonth();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Scenario | null>(null);
  const [sName, setSName] = useState("");
  const [sDesc, setSDesc] = useState("");
  const [sIncome, setSIncome] = useState("0");
  const [adjustments, setAdjustments] = useState<Record<string, string>>({});

  const baseline = useMemo(() => calc.monthlyForecast(budget, currentMonth), [budget, currentMonth]);
  const eoyForecast = calc.forecastEndOfYear(budget, currentMonth);

  const scenarioForecasts = useMemo(() => {
    return budget.scenarios.map((s) => ({
      scenario: s,
      data: calc.scenarioForecast(budget, s, currentMonth),
    }));
  }, [budget, currentMonth]);

  const chartData = useMemo(() => {
    return MONTH_SHORT.map((name, i) => {
      const point: Record<string, string | number> = { name, baseline: baseline[i] };
      scenarioForecasts.forEach((sf, idx) => {
        point[sf.scenario.name] = sf.data[i];
      });
      return point;
    });
  }, [baseline, scenarioForecasts]);

  const openForm = (scenario?: Scenario) => {
    if (scenario) {
      setEditing(scenario);
      setSName(scenario.name);
      setSDesc(scenario.description);
      setSIncome(scenario.incomeAdjustment.toString());
      const adj: Record<string, string> = {};
      scenario.adjustments.forEach((a) => { adj[a.categoryId] = a.newMonthlyAmount.toString(); });
      setAdjustments(adj);
    } else {
      setEditing(null);
      setSName("");
      setSDesc("");
      setSIncome("0");
      setAdjustments({});
    }
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName.trim()) return;
    const adj = Object.entries(adjustments)
      .filter(([_, v]) => v !== "" && v !== undefined)
      .map(([categoryId, v]) => ({ categoryId, newMonthlyAmount: parseFloat(v) || 0 }));
    const data = {
      name: sName.trim(),
      description: sDesc.trim(),
      incomeAdjustment: parseFloat(sIncome) || 0,
      adjustments: adj,
    };
    if (editing) updateScenario({ ...editing, ...data });
    else addScenario(data);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Financial Forecast</h2>
          <p className="text-sm text-slate-500">
            End-of-year projection: <span className={eoyForecast >= 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>{calc.formatCurrency(eoyForecast)}</span>
          </p>
        </div>
        <button
          onClick={() => openForm()}
          className="px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600"
        >
          + What-if Scenario
        </button>
      </div>

      {/* Forecast Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Cumulative Balance Forecast</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line type="monotone" dataKey="baseline" stroke="#6366f1" strokeWidth={2} dot={false} />
              {scenarioForecasts.map((sf, idx) => (
                <Line
                  key={sf.scenario.id}
                  type="monotone"
                  dataKey={sf.scenario.name}
                  stroke={SCENARIO_COLORS[idx % SCENARIO_COLORS.length]}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Annual projection summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Annual Projections</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-xs text-slate-500">Avg Monthly Income</p>
            <p className="text-lg font-bold text-indigo-600">
              {calc.formatCurrency(calc.averageMonthlyIncome(budget, currentMonth))}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-xs text-slate-500">Avg Monthly Expenses</p>
            <p className="text-lg font-bold text-red-500">
              {calc.formatCurrency(calc.averageMonthlyExpenses(budget, currentMonth))}
            </p>
          </div>
          <div className={`${eoyForecast >= 0 ? "bg-emerald-50" : "bg-red-50"} rounded-lg p-4`}>
            <p className="text-xs text-slate-500">End-of-Year Estimate</p>
            <p className={`text-lg font-bold ${eoyForecast >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {calc.formatCurrency(eoyForecast)}
            </p>
          </div>
        </div>
      </div>

      {/* Scenarios list */}
      {budget.scenarios.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Scenarios</h3>
          <div className="space-y-3">
            {budget.scenarios.map((s, idx) => {
              const sData = scenarioForecasts[idx]?.data;
              const eoy = sData ? sData[11] : 0;
              return (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SCENARIO_COLORS[idx % SCENARIO_COLORS.length] }} />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{s.name}</p>
                      {s.description && <p className="text-xs text-slate-400">{s.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${eoy >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      EOY: {calc.formatCurrency(eoy)}
                    </span>
                    <button onClick={() => openForm(s)} className="text-xs text-indigo-500 hover:text-indigo-700">Edit</button>
                    <button onClick={() => deleteScenario(s.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scenario Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit Scenario" : "Create What-if Scenario"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Scenario Name</label>
            <input type="text" value={sName} onChange={(e) => setSName(e.target.value)} placeholder="e.g., Lower income scenario" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input type="text" value={sDesc} onChange={(e) => setSDesc(e.target.value)} placeholder="Optional description" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Income Adjustment</label>
            <input type="number" value={sIncome} onChange={(e) => setSIncome(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            <p className="text-xs text-slate-400 mt-1">Use negative for less income (e.g., -500)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category Budget Overrides</label>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {budget.categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-slate-600 flex-1 truncate">{cat.name}</span>
                  <input
                    type="number"
                    placeholder={cat.budgetedMonthly.toString()}
                    value={adjustments[cat.id] ?? ""}
                    onChange={(e) => setAdjustments((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                    className="w-24 px-2 py-1 border border-slate-300 rounded text-xs text-right focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600">
            {editing ? "Update" : "Create"} Scenario
          </button>
        </form>
      </Modal>
    </div>
  );
}
