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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          {MONTH_NAMES[month]} {budget.year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => { setEditIncome(null); setShowIncomeForm(true); }}
            className="px-3 py-2 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600"
          >
            + Income
          </button>
          <button
            onClick={() => { setEditExpense(null); setShowExpenseForm(true); }}
            className="px-3 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600"
          >
            + Expense
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-xl p-4">
          <p className="text-xs text-slate-500">Income</p>
          <p className="text-xl font-bold text-emerald-600">{calc.formatCurrency(income)}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-xs text-slate-500">Expenses</p>
          <p className="text-xl font-bold text-red-500">{calc.formatCurrency(expenses)}</p>
        </div>
        <div className={`${net >= 0 ? "bg-blue-50" : "bg-red-50"} rounded-xl p-4`}>
          <p className="text-xs text-slate-500">Net</p>
          <p className={`text-xl font-bold ${net >= 0 ? "text-blue-600" : "text-red-600"}`}>
            {calc.formatCurrency(net)}
          </p>
        </div>
      </div>

      {/* Category budgets */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Category Budgets</h3>
        <div className="space-y-3">
          {budget.categories.map((cat) => {
            const spent = calc.categorySpend(budget, cat.id, month);
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-slate-700">{cat.name}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {calc.formatCurrency(spent)} / {calc.formatCurrency(cat.budgetedMonthly)}
                  </span>
                </div>
                <ProgressBar value={spent} max={cat.budgetedMonthly} color={cat.color} showLabel={false} size="sm" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Income list */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Income</h3>
        {monthData.incomes.length === 0 ? (
          <p className="text-sm text-slate-400">No income entries yet</p>
        ) : (
          <div className="space-y-2">
            {monthData.incomes.map((inc) => (
              <div key={inc.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{inc.source}</p>
                  {inc.recurring && <span className="text-xs text-indigo-500">Recurring</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-emerald-600">
                    +{calc.formatCurrency(inc.amount)}
                  </span>
                  <button
                    onClick={() => { setEditIncome(inc); setShowIncomeForm(true); }}
                    className="text-xs text-slate-400 hover:text-indigo-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteIncome(month, inc.id)}
                    className="text-xs text-slate-400 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expense list */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Expenses</h3>
        {monthData.expenses.length === 0 ? (
          <p className="text-sm text-slate-400">No expenses yet</p>
        ) : (
          <div className="space-y-2">
            {monthData.expenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: calc.getCategoryColor(budget.categories, exp.categoryId) }}
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{exp.description}</p>
                    <p className="text-xs text-slate-400">
                      {calc.getCategoryName(budget.categories, exp.categoryId)}
                      {exp.recurring && " • Recurring"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-red-500">
                    -{calc.formatCurrency(exp.amount)}
                  </span>
                  <button
                    onClick={() => { setEditExpense(exp); setShowExpenseForm(true); }}
                    className="text-xs text-slate-400 hover:text-indigo-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteExpense(month, exp.id)}
                    className="text-xs text-slate-400 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        open={showIncomeForm}
        onClose={() => setShowIncomeForm(false)}
        title={editIncome ? "Edit Income" : "Add Income"}
      >
        <IncomeForm
          month={month}
          existing={editIncome}
          onDone={() => setShowIncomeForm(false)}
        />
      </Modal>
      <Modal
        open={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        title={editExpense ? "Edit Expense" : "Add Expense"}
      >
        <ExpenseForm
          month={month}
          existing={editExpense}
          onDone={() => setShowExpenseForm(false)}
        />
      </Modal>
    </div>
  );
}
