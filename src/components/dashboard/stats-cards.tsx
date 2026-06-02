"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Receipt, Calendar, Repeat, CreditCard } from "lucide-react";

interface StatsCardsProps {
  totalExpenses: number;
  monthlyExpenses: number;
  activeSubscriptions: number;
  monthlySubscriptionCost: number;
}

export function StatsCards({
  totalExpenses,
  monthlyExpenses,
  activeSubscriptions,
  monthlySubscriptionCost,
}: StatsCardsProps) {
  const cards = [
    {
      title: "Toplam Gider",
      value: formatCurrency(totalExpenses),
      icon: Receipt,
      description: "Tüm zamanlar",
    },
    {
      title: "Bu Ay",
      value: formatCurrency(monthlyExpenses),
      icon: Calendar,
      description: "Aylık harcama",
    },
    {
      title: "Aktif Abonelik",
      value: activeSubscriptions.toString(),
      icon: Repeat,
      description: "Devam eden",
    },
    {
      title: "Aylık Abonelik",
      value: formatCurrency(monthlySubscriptionCost),
      icon: CreditCard,
      description: "Tahmini maliyet",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
