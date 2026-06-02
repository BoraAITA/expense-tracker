"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ExpenseWithCategory } from "@/types";
import { ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

interface RecentExpensesProps {
  expenses: ExpenseWithCategory[];
}

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Son Giderler</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/expenses">
            Tümünü gör <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <EmptyState title="Gider yok" description="Henüz gider eklenmemiş." />
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="font-medium">{expense.title}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                <span className="font-semibold">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
