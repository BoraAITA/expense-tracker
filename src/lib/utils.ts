import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  type CurrencyCode,
  CURRENCY_SYMBOLS,
  isCurrencyCode,
} from "@/lib/currency";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | string,
  currency: CurrencyCode = "TRY"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const localeMap: Record<CurrencyCode, string> = {
    TRY: "tr-TR",
    USD: "en-US",
    EUR: "de-DE",
  };
  return new Intl.NumberFormat(localeMap[currency], {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatCurrencyCompact(
  amount: number | string,
  currency: CurrencyCode = "TRY"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const symbol = CURRENCY_SYMBOLS[currency];
  return `${symbol}${num.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function parseCurrency(value: unknown): CurrencyCode {
  if (typeof value === "string" && isCurrencyCode(value)) return value;
  return "TRY";
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function decimalToNumber(value: { toString(): string } | number): number {
  return typeof value === "number" ? value : parseFloat(value.toString());
}
