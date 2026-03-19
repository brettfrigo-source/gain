"use client";
import { useState } from "react";
import { TabId } from "@/types";
import { BudgetContext, useBudgetState } from "@/hooks/useBudget";
import Header from "./layout/Header";
import TabBar from "./layout/TabBar";
import Dashboard from "./dashboard/Dashboard";
import AnnualOverview from "./budget/AnnualOverview";
import CategoryManager from "./categories/CategoryManager";
import SavingsGoals from "./savings/SavingsGoals";
import ForecastView from "./forecasting/ForecastView";
import ImportExport from "./importexport/ImportExport";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const budgetState = useBudgetState(new Date().getFullYear());

  return (
    <BudgetContext.Provider value={budgetState}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "budget" && <AnnualOverview />}
          {activeTab === "categories" && <CategoryManager />}
          {activeTab === "savings" && <SavingsGoals />}
          {activeTab === "forecasting" && <ForecastView />}
          {activeTab === "import-export" && <ImportExport />}
        </main>
      </div>
    </BudgetContext.Provider>
  );
}
