export type CurrencyCode = "TRY" | "USD" | "EUR";

export const CURRENCIES: CurrencyCode[] = ["TRY", "USD", "EUR"];

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  TRY: "Türk Lirası (₺)",
  USD: "Amerikan Doları ($)",
  EUR: "Euro (€)",
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
};

/** Fixed rates to TRY for dashboard converted totals */
export const EXCHANGE_RATES_TO_TRY: Record<CurrencyCode, number> = {
  TRY: 1,
  USD: 34.5,
  EUR: 37.2,
};

export function toTry(amount: number, currency: CurrencyCode): number {
  return amount * EXCHANGE_RATES_TO_TRY[currency];
}

export function isCurrencyCode(value: string): value is CurrencyCode {
  return CURRENCIES.includes(value as CurrencyCode);
}
