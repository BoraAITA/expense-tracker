import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { decimalToNumber } from "@/lib/utils";
import type { CurrencyCode } from "@/lib/currency";
import {
  emptyCurrencyTotals,
  addToCurrencyTotals,
  sumConvertedTry,
  monthlySubscriptionAmount,
  serializeExpenseWithCategory,
  serializeSubscription,
} from "@/lib/dashboard-stats";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { tr } from "date-fns/locale";

async function aggregateExpensesByCurrency(
  userId: string,
  dateFilter?: { gte: Date; lte: Date }
) {
  const totals = emptyCurrencyTotals();
  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      ...(dateFilter ? { date: dateFilter } : {}),
    },
    select: { amount: true, currency: true },
  });

  for (const e of expenses) {
    addToCurrencyTotals(
      totals,
      e.currency as CurrencyCode,
      decimalToNumber(e.amount)
    );
  }
  return totals;
}

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = session!.user.id;
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [totalExpensesByCurrency, monthlyExpensesByCurrency, activeSubscriptions, recentExpenses, allSubscriptions] =
    await Promise.all([
      aggregateExpensesByCurrency(userId),
      aggregateExpensesByCurrency(userId, {
        gte: monthStart,
        lte: monthEnd,
      }),
      prisma.subscription.findMany({
        where: { userId, status: "ACTIVE" },
      }),
      prisma.expense.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { date: "desc" },
        take: 5,
      }),
      prisma.subscription.findMany({
        where: { userId, status: "ACTIVE" },
        orderBy: { nextDueDate: "asc" },
        take: 5,
      }),
    ]);

  const monthlySubscriptionCostByCurrency = emptyCurrencyTotals();
  for (const sub of activeSubscriptions) {
    const monthly = monthlySubscriptionAmount(
      decimalToNumber(sub.amount),
      sub.interval
    );
    addToCurrencyTotals(
      monthlySubscriptionCostByCurrency,
      sub.currency as CurrencyCode,
      monthly
    );
  }

  const monthlyChart = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i);
    const start = startOfMonth(d);
    const end = endOfMonth(d);
    const byCurrency = await aggregateExpensesByCurrency(userId, {
      gte: start,
      lte: end,
    });
    monthlyChart.push({
      month: format(d, "MMM yyyy", { locale: tr }),
      byCurrency,
      totalTry: sumConvertedTry(byCurrency),
    });
  }

  return NextResponse.json({
    totalExpensesByCurrency,
    monthlyExpensesByCurrency,
    totalExpensesConvertedTry: sumConvertedTry(totalExpensesByCurrency),
    monthlyExpensesConvertedTry: sumConvertedTry(monthlyExpensesByCurrency),
    activeSubscriptions: activeSubscriptions.length,
    monthlySubscriptionCostByCurrency,
    monthlySubscriptionCostConvertedTry: sumConvertedTry(
      monthlySubscriptionCostByCurrency
    ),
    monthlyChart,
    recentExpenses: recentExpenses.map(serializeExpenseWithCategory),
    upcomingSubscriptions: allSubscriptions.map(serializeSubscription),
  });
}
