export type ID = string;

export interface Category {
  id: ID;
  name: string;
  color: string;
  budgetedMonthly: number;
  type: "need" | "want" | "saving";
}

export interface IncomeEntry {
  id: ID;
  source: string;
  amount: number;
  recurring: boolean;
}

export interface Expense {
  id: ID;
  categoryId: ID;
  description: string;
  amount: number;
  recurring: boolean;
  date: string;
}

export interface MonthBudget {
  month: number;
  incomes: IncomeEntry[];
  expenses: Expense[];
}

export interface SavingsGoal {
  id: ID;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  type: "short-term" | "long-term";
}

export interface EmergencyFund {
  targetMonths: number;
  currentAmount: number;
  monthlyExpenseEstimate: number;
}

export interface ScenarioAdjustment {
  categoryId: ID;
  newMonthlyAmount: number;
}

export interface Scenario {
  id: ID;
  name: string;
  description: string;
  incomeAdjustment: number;
  adjustments: ScenarioAdjustment[];
}

export interface BudgetYear {
  id: ID;
  year: number;
  months: MonthBudget[];
  savingsGoals: SavingsGoal[];
  emergencyFund: EmergencyFund;
  categories: Category[];
  scenarios: Scenario[];
}

export type TabId =
  | "dashboard"
  | "budget"
  | "categories"
  | "savings"
  | "forecasting"
  | "import-export";
