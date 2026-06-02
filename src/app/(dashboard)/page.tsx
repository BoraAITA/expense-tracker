"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { MonthlyChart } from "@/components/dashboard/monthly-chart";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { DashboardStats } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <Header title="Dashboard" description="Gider özeti ve istatistikler" />
        <LoadingSpinner />
      </>
    );
  }

  if (!stats) {
    return (
      <>
        <Header title="Dashboard" />
        <p className="p-6 text-muted-foreground">Veriler yüklenemedi.</p>
      </>
    );
  }

  return (
    <>
      <Header
        title="Dashboard"
        description="Gider özeti ve istatistikler"
      />
      <div className="flex-1 space-y-6 p-6">
        <StatsCards
          totalExpenses={stats.totalExpenses}
          monthlyExpenses={stats.monthlyExpenses}
          activeSubscriptions={stats.activeSubscriptions}
          monthlySubscriptionCost={stats.monthlySubscriptionCost}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <MonthlyChart data={stats.monthlyChart} />
          <RecentExpenses expenses={stats.recentExpenses} />
        </div>
      </div>
    </>
  );
}
