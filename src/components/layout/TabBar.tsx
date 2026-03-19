"use client";
import { TabId } from "@/types";

const TABS: { id: TabId; label: string }[] = [
  { id: "dashboard", label: "Overview" },
  { id: "budget", label: "Budget" },
  { id: "categories", label: "Categories" },
  { id: "savings", label: "Savings" },
  { id: "forecasting", label: "Forecast" },
  { id: "import-export", label: "Data" },
];

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="sticky top-14 z-20 backdrop-blur-xl bg-[rgba(251,251,253,0.8)]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex gap-1 py-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-[var(--fg)] text-white"
                  : "text-[var(--fg-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--fg)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
