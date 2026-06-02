"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CURRENCIES, CURRENCY_LABELS } from "@/lib/currency";
import type { CurrencyCode } from "@/lib/currency";

interface CurrencySelectProps {
  value: CurrencyCode;
  onChange: (value: CurrencyCode) => void;
  id?: string;
  label?: string;
}

export function CurrencySelect({
  value,
  onChange,
  id = "currency",
  label = "Para Birimi",
}: CurrencySelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v as CurrencyCode)}>
        <SelectTrigger id={id} className="min-h-11">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map((c) => (
            <SelectItem key={c} value={c}>
              {CURRENCY_LABELS[c]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
