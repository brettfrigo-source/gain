"use client";
import { useBudgetContext } from "@/hooks/useBudget";

export default function Header() {
  const { year, setYear } = useBudgetContext();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Gain</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setYear(year - 1)}
            className="px-2 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
          >
            &larr;
          </button>
          <span className="text-lg font-semibold text-slate-900 min-w-[4rem] text-center">
            {year}
          </span>
          <button
            onClick={() => setYear(year + 1)}
            className="px-2 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
          >
            &rarr;
          </button>
        </div>
      </div>
    </header>
  );
}
