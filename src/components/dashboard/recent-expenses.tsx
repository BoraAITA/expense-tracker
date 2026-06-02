"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ExpenseWithCategory } from "@/types";
import { ArrowRight, Receipt } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

interface RecentExpensesProps {
  expenses: ExpenseWithCategory[];
}

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  return (
    <Card className="shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Son Giderler</CardTitle>
        <Button variant="ghost" size="sm" className="min-h-10" asChild>
          <Link href="/expenses">
            Tümünü gör <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <EmptyState
            title="Gider yok"
            description="Henüz gider eklenmemiş."
            icon={Receipt}
          />
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 space-y-1">
                  <p className="truncate font-medium">{expense.title}</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatDate(expense.date)}</span>
                    {expense.category && (
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: expense.category.color,
                          color: expense.category.color,
                        }}
                      >
                        {expense.category.name}
                      </Badge>
                    )}
                  </div>
                </div>
                <span className="shrink-0 font-semibold">
                  {formatCurrency(expense.amount, expense.currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
