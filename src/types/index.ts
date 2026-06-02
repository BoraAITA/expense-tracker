import type { CurrencyCode } from "@/lib/currency";

export interface CurrencyTotals {
  TRY: number;
  USD: number;
  EUR: number;
}

export interface DashboardStats {
  totalExpensesByCurrency: CurrencyTotals;
  monthlyExpensesByCurrency: CurrencyTotals;
  totalExpensesConvertedTry: number;
  monthlyExpensesConvertedTry: number;
  activeSubscriptions: number;
  monthlySubscriptionCostByCurrency: CurrencyTotals;
  monthlySubscriptionCostConvertedTry: number;
  monthlyChart: { month: string; byCurrency: CurrencyTotals; totalTry: number }[];
  recentExpenses: ExpenseWithCategory[];
  upcomingSubscriptions: SubscriptionItem[];
}

export interface ExpenseWithCategory {
  id: string;
  title: string;
  amount: number;
  currency: CurrencyCode;
  description: string | null;
  date: string;
  categoryId: string | null;
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
  createdAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  _count?: { expenses: number };
}

export interface SubscriptionItem {
  id: string;
  name: string;
  amount: number;
  currency: CurrencyCode;
  logoUrl: string | null;
  interval: string;
  status: string;
  nextDueDate: string;
  reminderDays: number;
}
