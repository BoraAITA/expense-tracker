"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { MonthlyChart } from "@/components/dashboard/monthly-chart";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { UpcomingSubscriptions } from "@/components/dashboard/upcoming-subscriptions";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { DashboardStats } from "@/types";
import { EmptyState } from "@/components/shared/empty-state";
import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <>
        <Header title="Dashboard" description="Gider özeti ve istatistikler" />
        <DashboardSkeleton />
      </>
    );
  }

  if (error || !stats) {
    return (
      <>
        <Header title="Dashboard" />
        <div className="p-4 sm:p-6">
          <EmptyState
            title="Veriler yüklenemedi"
            description="Sayfayı yenileyerek tekrar deneyin."
            icon={LayoutDashboard}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Dashboard"
        description="Gider özeti ve istatistikler"
      />
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <StatsCards
          totalExpensesByCurrency={stats.totalExpensesByCurrency}
          monthlyExpensesByCurrency={stats.monthlyExpensesByCurrency}
          totalExpensesConvertedTry={stats.totalExpensesConvertedTry}
          monthlyExpensesConvertedTry={stats.monthlyExpensesConvertedTry}
          activeSubscriptions={stats.activeSubscriptions}
          monthlySubscriptionCostByCurrency={
            stats.monthlySubscriptionCostByCurrency
          }
          monthlySubscriptionCostConvertedTry={
            stats.monthlySubscriptionCostConvertedTry
          }
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <MonthlyChart data={stats.monthlyChart} />
          <RecentExpenses expenses={stats.recentExpenses} />
        </div>
        <UpcomingSubscriptions subscriptions={stats.upcomingSubscriptions} />
      </div>
    </>
  );
}
