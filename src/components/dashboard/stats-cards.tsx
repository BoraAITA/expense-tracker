"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { CurrencyCode } from "@/lib/currency";
import { Receipt, Calendar, Repeat, CreditCard } from "lucide-react";
import { CurrencyTotalsDisplay } from "@/components/shared/currency-totals";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  totalExpensesByCurrency: Record<CurrencyCode, number>;
  monthlyExpensesByCurrency: Record<CurrencyCode, number>;
  totalExpensesConvertedTry: number;
  monthlyExpensesConvertedTry: number;
  activeSubscriptions: number;
  monthlySubscriptionCostByCurrency: Record<CurrencyCode, number>;
  monthlySubscriptionCostConvertedTry: number;
}

export function StatsCards({
  totalExpensesByCurrency,
  monthlyExpensesByCurrency,
  totalExpensesConvertedTry,
  monthlyExpensesConvertedTry,
  activeSubscriptions,
  monthlySubscriptionCostByCurrency,
  monthlySubscriptionCostConvertedTry,
}: StatsCardsProps) {
  const cards = [
    {
      title: "Toplam Gider",
      value: <CurrencyTotalsDisplay totals={totalExpensesByCurrency} />,
      converted: totalExpensesConvertedTry,
      icon: Receipt,
      description: "Tüm zamanlar",
      gradient: "from-rose-500/10 to-transparent",
    },
    {
      title: "Bu Ay",
      value: <CurrencyTotalsDisplay totals={monthlyExpensesByCurrency} />,
      converted: monthlyExpensesConvertedTry,
      icon: Calendar,
      description: "Aylık harcama",
      gradient: "from-blue-500/10 to-transparent",
    },
    {
      title: "Aktif Abonelik",
      value: (
        <span className="text-2xl font-bold">{activeSubscriptions}</span>
      ),
      converted: null as number | null,
      icon: Repeat,
      description: "Devam eden",
      gradient: "from-violet-500/10 to-transparent",
    },
    {
      title: "Aylık Abonelik",
      value: (
        <CurrencyTotalsDisplay totals={monthlySubscriptionCostByCurrency} />
      ),
      converted: monthlySubscriptionCostConvertedTry,
      icon: CreditCard,
      description: "Tahmini maliyet",
      gradient: "from-amber-500/10 to-transparent",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={cn(
              "overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md",
              "bg-gradient-to-br",
              card.gradient
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className="rounded-lg bg-background/80 p-2 shadow-sm">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.converted !== null && (
                <p className="mt-1 text-xs text-muted-foreground">
                  ≈ {formatCurrency(card.converted, "TRY")} (TL karşılığı)
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
