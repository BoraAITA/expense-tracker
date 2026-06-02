import type { CurrencyCode } from "@/lib/currency";
import { toTry } from "@/lib/currency";
import { decimalToNumber } from "@/lib/utils";

export function emptyCurrencyTotals(): Record<CurrencyCode, number> {
  return { TRY: 0, USD: 0, EUR: 0 };
}

export function addToCurrencyTotals(
  totals: Record<CurrencyCode, number>,
  currency: CurrencyCode,
  amount: number
) {
  totals[currency] += amount;
}

export function sumConvertedTry(totals: Record<CurrencyCode, number>): number {
  return (Object.entries(totals) as [CurrencyCode, number][]).reduce(
    (sum, [currency, amount]) => sum + toTry(amount, currency),
    0
  );
}

export function monthlySubscriptionAmount(
  amount: number,
  interval: string
): number {
  if (interval === "YEARLY") return amount / 12;
  if (interval === "WEEKLY") return amount * 4;
  return amount;
}

export function serializeExpenseWithCategory(expense: {
  id: string;
  title: string;
  amount: { toString(): string };
  currency: CurrencyCode;
  description: string | null;
  date: Date;
  categoryId: string | null;
  createdAt: Date;
  category?: { id: string; name: string; color: string } | null;
}) {
  return {
    id: expense.id,
    title: expense.title,
    amount: decimalToNumber(expense.amount),
    currency: expense.currency,
    description: expense.description,
    date: expense.date.toISOString(),
    categoryId: expense.categoryId,
    category: expense.category ?? null,
    createdAt: expense.createdAt.toISOString(),
  };
}

export function serializeSubscription(sub: {
  id: string;
  name: string;
  amount: { toString(): string };
  currency: CurrencyCode;
  logoUrl: string | null;
  interval: string;
  status: string;
  nextDueDate: Date;
  reminderDays: number;
}) {
  return {
    id: sub.id,
    name: sub.name,
    amount: decimalToNumber(sub.amount),
    currency: sub.currency,
    logoUrl: sub.logoUrl,
    interval: sub.interval,
    status: sub.status,
    nextDueDate: sub.nextDueDate.toISOString(),
    reminderDays: sub.reminderDays,
  };
}
