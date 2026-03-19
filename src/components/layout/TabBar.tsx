"use client";
import { TabId } from "@/types";

const TABS: { id: TabId; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "budget", label: "Budget" },
  { id: "categories", label: "Categories" },
  { id: "savings", label: "Savings" },
  { id: "forecasting", label: "Forecast" },
  { id: "import-export", label: "Import/Export" },
];

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="bg-white border-b border-slate-200 overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
