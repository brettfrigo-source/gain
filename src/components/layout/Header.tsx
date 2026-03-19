"use client";
import { useBudgetContext } from "@/hooks/useBudget";

export default function Header() {
  const { year, setYear } = useBudgetContext();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-[rgba(251,251,253,0.8)]">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight" style={{ color: "var(--fg)" }}>
          Gain
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setYear(year - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-[var(--bg-secondary)]"
            style={{ color: "var(--fg-secondary)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span className="text-sm font-semibold min-w-[3.5rem] text-center" style={{ color: "var(--fg)" }}>
            {year}
          </span>
          <button
            onClick={() => setYear(year + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-[var(--bg-secondary)]"
            style={{ color: "var(--fg-secondary)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </header>
  );
}
