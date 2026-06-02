"use client";

import type { CurrencyCode } from "@/lib/currency";
import { CURRENCIES } from "@/lib/currency";
import { formatCurrency } from "@/lib/utils";

interface CurrencyTotalsProps {
  totals: Record<CurrencyCode, number>;
  className?: string;
}

export function CurrencyTotalsDisplay({ totals, className }: CurrencyTotalsProps) {
  const nonZero = CURRENCIES.filter((c) => totals[c] > 0);

  if (nonZero.length === 0) {
    return <span className={className}>{formatCurrency(0, "TRY")}</span>;
  }

  if (nonZero.length === 1) {
    const c = nonZero[0];
    return (
      <span className={className}>{formatCurrency(totals[c], c)}</span>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-0.5">
        {nonZero.map((c) => (
          <div key={c} className="text-sm leading-tight">
            {formatCurrency(totals[c], c)}
          </div>
        ))}
      </div>
    </div>
  );
}
