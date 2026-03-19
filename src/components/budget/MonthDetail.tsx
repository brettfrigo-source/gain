"use client";
import { useState } from "react";
import { useBudgetContext } from "@/hooks/useBudget";
import * as calc from "@/lib/calculations";
import { MONTH_NAMES } from "@/lib/defaults";
import IncomeForm from "./IncomeForm";
import ExpenseForm from "./ExpenseForm";
import Modal from "../ui/Modal";
import ProgressBar from "../ui/ProgressBar";
import { IncomeEntry, Expense } from "@/types";

interface Props {
  month: number;
}

export default function MonthDetail({ month }: Props) {
  const { budget, deleteIncome, deleteExpense } = useBudgetContext();
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editIncome, setEditIncome] = useState<IncomeEntry | null>(null);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);

  const monthData = budget.months[month];
  const income = calc.totalIncome(budget, month);
  const expenses = calc.totalExpenses(budget, month);
  const net = income - expenses;

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div>
        <h1 className="section-title mb-2">{MONTH_NAMES[month]}</h1>
        <div className="flex flex-wrap gap-8 mt-6">
          {[
            { label: "Income", value: income, color: "var(--success)" },
            { label: "Expenses", value: expenses, color: "var(--danger)" },
            { label: "Net", value: net, color: net >= 0 ? "var(--success)" : "var(--danger)" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-xs mb-1" style={{ color: "var(--fg-tertiary)" }}>{s.label}</p>
              <p className="text-2xl font-bold tracking-tight" style={{ color: s.color }}>
                {calc.formatCurrency(s.value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Category progress */}
      <section>
        <h2 className="text-lg font-semibold tracking-tight mb-6" style={{ color: "var(--fg)" }}>
          Category budgets
        </h2>
        <div className="space-y-5">
          {budget.categories.map((cat) => {
            const spent = calc.categorySpend(budget, cat.id, month);
            const pct = cat.budgetedMonthly > 0 ? Math.round((spent / cat.budgetedMonthly) * 100) : 0;
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>{cat.name}</span>
                  </div>
                  <span className="text-xs tabular-nums" style={{ color: "var(--fg-tertiary)" }}>
                    {calc.formatCurrency(spent)} / {calc.formatCurrency(cat.budgetedMonthly)}
                  </span>
                </div>
                <ProgressBar value={spent} max={cat.budgetedMonthly} color={cat.color} size="sm" />
              </div>
            );
          })}
        </div>
      </section>

      {/* Income */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold tracking-tight" style={{ color: "var(--fg)" }}>Income</h2>
          <button
            onClick={() => { setEditIncome(null); setShowIncomeForm(true); }}
            className="btn-primary text-xs px-4 py-2"
          >
            Add income
          </button>
        </div>
        {monthData.incomes.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--fg-tertiary)" }}>No income entries yet.</p>
        ) : (
          <div className="space-y-1">
            {monthData.incomes.map((inc) => (
              <div
                key={inc.id}
                className="flex items-center justify-between py-3.5 px-4 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors duration-200 group"
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--fg)" }}>{inc.source}</p>
                  {inc.recurring && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--fg-tertiary)" }}>Recurring</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--success)" }}>
                    +{calc.formatCurrency(inc.amount)}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => { setEditIncome(inc); setShowIncomeForm(true); }}
                      className="btn-ghost text-xs px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteIncome(month, inc.id)}
                      className="btn-ghost text-xs px-2 py-1 hover:!text-[var(--danger)]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Expenses */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold tracking-tight" style={{ color: "var(--fg)" }}>Expenses</h2>
          <button
            onClick={() => { setEditExpense(null); setShowExpenseForm(true); }}
            className="btn-primary text-xs px-4 py-2"
          >
            Add expense
          </button>
        </div>
        {monthData.expenses.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--fg-tertiary)" }}>No expenses yet.</p>
        ) : (
          <div className="space-y-1">
            {monthData.expenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between py-3.5 px-4 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: calc.getCategoryColor(budget.categories, exp.categoryId) }}
                  />
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--fg)" }}>{exp.description}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--fg-tertiary)" }}>
                      {calc.getCategoryName(budget.categories, exp.categoryId)}
                      {exp.recurring && " · Recurring"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--danger)" }}>
                    -{calc.formatCurrency(exp.amount)}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => { setEditExpense(exp); setShowExpenseForm(true); }}
                      className="btn-ghost text-xs px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteExpense(month, exp.id)}
                      className="btn-ghost text-xs px-2 py-1 hover:!text-[var(--danger)]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <Modal open={showIncomeForm} onClose={() => setShowIncomeForm(false)} title={editIncome ? "Edit income" : "Add income"}>
        <IncomeForm month={month} existing={editIncome} onDone={() => setShowIncomeForm(false)} />
      </Modal>
      <Modal open={showExpenseForm} onClose={() => setShowExpenseForm(false)} title={editExpense ? "Edit expense" : "Add expense"}>
        <ExpenseForm month={month} existing={editExpense} onDone={() => setShowExpenseForm(false)} />
      </Modal>
    </div>
  );
}
