import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { decimalToNumber } from "@/lib/utils";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { tr } from "date-fns/locale";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = session!.user.id;
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [allExpenses, monthlyExpenses, activeSubscriptions, recentExpenses] =
    await Promise.all([
      prisma.expense.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: {
          userId,
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
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
    ]);

  const monthlyChart = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i);
    const start = startOfMonth(d);
    const end = endOfMonth(d);
    const agg = await prisma.expense.aggregate({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });
    monthlyChart.push({
      month: format(d, "MMM yyyy", { locale: tr }),
      amount: decimalToNumber(agg._sum.amount ?? 0),
    });
  }

  const monthlySubscriptionCost = activeSubscriptions.reduce((sum, sub) => {
    const amount = decimalToNumber(sub.amount);
    if (sub.interval === "YEARLY") return sum + amount / 12;
    if (sub.interval === "WEEKLY") return sum + amount * 4;
    return sum + amount;
  }, 0);

  return NextResponse.json({
    totalExpenses: decimalToNumber(allExpenses._sum.amount ?? 0),
    monthlyExpenses: decimalToNumber(monthlyExpenses._sum.amount ?? 0),
    activeSubscriptions: activeSubscriptions.length,
    monthlySubscriptionCost,
    monthlyChart,
    recentExpenses: recentExpenses.map((e) => ({
      id: e.id,
      title: e.title,
      amount: decimalToNumber(e.amount),
      description: e.description,
      date: e.date.toISOString(),
      categoryId: e.categoryId,
      category: e.category
        ? { id: e.category.id, name: e.category.name, color: e.category.color }
        : null,
      createdAt: e.createdAt.toISOString(),
    })),
  });
}
