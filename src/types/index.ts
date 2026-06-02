export interface DashboardStats {
  totalExpenses: number;
  monthlyExpenses: number;
  activeSubscriptions: number;
  monthlySubscriptionCost: number;
  monthlyChart: { month: string; amount: number }[];
  recentExpenses: ExpenseWithCategory[];
}

export interface ExpenseWithCategory {
  id: string;
  title: string;
  amount: number;
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
  interval: string;
  status: string;
  nextDueDate: string;
  reminderDays: number;
}
