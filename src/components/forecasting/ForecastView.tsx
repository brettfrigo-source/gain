"use client";
import { useState, useMemo } from "react";
import { useBudgetContext } from "@/hooks/useBudget";
import { Scenario } from "@/types";
import * as calc from "@/lib/calculations";
import { MONTH_SHORT } from "@/lib/defaults";
import Modal from "../ui/Modal";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const LINE_COLORS = ["#ff9f0a", "#af52de", "#00c7be", "#ff2d55", "#34c759"];

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
  const eoy = calc.forecastEndOfYear(budget, currentMonth);

  const scenarioForecasts = useMemo(() => {
    return budget.scenarios.map((s) => ({
      scenario: s,
      data: calc.scenarioForecast(budget, s, currentMonth),
    }));
  }, [budget, currentMonth]);

  const chartData = useMemo(() => {
    return MONTH_SHORT.map((name, i) => {
      const point: Record<string, string | number> = { name, Baseline: baseline[i] };
      scenarioForecasts.forEach((sf) => {
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
    const data = { name: sName.trim(), description: sDesc.trim(), incomeAdjustment: parseFloat(sIncome) || 0, adjustments: adj };
    if (editing) updateScenario({ ...editing, ...data });
    else addScenario(data);
    setShowForm(false);
  };

  return (
    <div className="space-y-16">
      <section>
        <div className="flex items-end justify-between mb-2">
          <h1 className="section-title">Forecast</h1>
          <button onClick={() => openForm()} className="btn-primary">What-if scenario</button>
        </div>
        <p className="section-subtitle mb-10">
          Projected year-end balance:{" "}
          <span className="font-semibold" style={{ color: eoy >= 0 ? "var(--success)" : "var(--danger)" }}>
            {calc.formatCurrency(eoy)}
          </span>
        </p>

        <div className="card">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#a1a1a6" }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#a1a1a6" }} tickFormatter={(v) => `$${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}${v >= 1000 ? "k" : ""}`} width={48} />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", fontSize: "13px", padding: "12px 16px" }}
                  cursor={{ stroke: "#e8e8ed" }}
                />
                <Line type="monotone" dataKey="Baseline" stroke="#1d1d1f" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#1d1d1f", stroke: "#fff", strokeWidth: 2 }} />
                {scenarioForecasts.map((sf, idx) => (
                  <Line key={sf.scenario.id} type="monotone" dataKey={sf.scenario.name} stroke={LINE_COLORS[idx % LINE_COLORS.length]} strokeWidth={2} strokeDasharray="6 4" dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Projections */}
      <section>
        <h2 className="text-lg font-semibold tracking-tight mb-6" style={{ color: "var(--fg)" }}>
          Annual projections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Avg. monthly income", value: calc.averageMonthlyIncome(budget, currentMonth), color: "var(--fg)" },
            { label: "Avg. monthly expenses", value: calc.averageMonthlyExpenses(budget, currentMonth), color: "var(--fg)" },
            { label: "Year-end estimate", value: eoy, color: eoy >= 0 ? "var(--success)" : "var(--danger)" },
          ].map((item) => (
            <div key={item.label} className="card" style={{ background: "var(--bg-secondary)" }}>
              <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: "var(--fg-tertiary)" }}>{item.label}</p>
              <p className="text-2xl font-bold tracking-tight" style={{ color: item.color }}>{calc.formatCurrency(item.value)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scenarios list */}
      {budget.scenarios.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold tracking-tight mb-6" style={{ color: "var(--fg)" }}>
            Scenarios
          </h2>
          <div className="space-y-1">
            {budget.scenarios.map((s, idx) => {
              const sData = scenarioForecasts[idx]?.data;
              const sEoy = sData ? sData[11] : 0;
              return (
                <div key={s.id} className="flex items-center justify-between py-4 px-4 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors duration-200 group">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: LINE_COLORS[idx % LINE_COLORS.length] }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--fg)" }}>{s.name}</p>
                      {s.description && <p className="text-xs mt-0.5" style={{ color: "var(--fg-tertiary)" }}>{s.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold tabular-nums" style={{ color: sEoy >= 0 ? "var(--success)" : "var(--danger)" }}>
                      {calc.formatCurrency(sEoy)}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={() => openForm(s)} className="btn-ghost text-xs px-2 py-1">Edit</button>
                      <button onClick={() => deleteScenario(s.id)} className="btn-ghost text-xs px-2 py-1 hover:!text-[var(--danger)]">Remove</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Scenario Form */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit scenario" : "What-if scenario"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>Name</label>
            <input type="text" value={sName} onChange={(e) => setSName(e.target.value)} placeholder="Lower income, cut spending, etc." className="input-field" autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>Description</label>
            <input type="text" value={sDesc} onChange={(e) => setSDesc(e.target.value)} placeholder="Optional" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--fg-secondary)" }}>Monthly income change</label>
            <input type="number" value={sIncome} onChange={(e) => setSIncome(e.target.value)} className="input-field" />
            <p className="text-xs mt-1.5" style={{ color: "var(--fg-tertiary)" }}>Negative for less income</p>
          </div>
          <div>
            <label className="block text-xs font-medium mb-3" style={{ color: "var(--fg-secondary)" }}>Category overrides</label>
            <div className="max-h-52 overflow-y-auto space-y-2">
              {budget.categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs flex-1 truncate" style={{ color: "var(--fg-secondary)" }}>{cat.name}</span>
                  <input
                    type="number"
                    placeholder={cat.budgetedMonthly.toString()}
                    value={adjustments[cat.id] ?? ""}
                    onChange={(e) => setAdjustments((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                    className="w-24 px-3 py-2 text-xs text-right rounded-lg outline-none transition-all duration-200"
                    style={{ background: "var(--bg-secondary)", border: "1.5px solid transparent", color: "var(--fg)" }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "transparent"; }}
                  />
                </div>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary w-full mt-2">{editing ? "Save changes" : "Create scenario"}</button>
        </form>
      </Modal>
    </div>
  );
}
