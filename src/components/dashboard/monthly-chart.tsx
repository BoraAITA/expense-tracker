"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { CurrencyCode } from "@/lib/currency";

interface MonthlyChartProps {
  data: {
    month: string;
    byCurrency: Record<CurrencyCode, number>;
    totalTry: number;
  }[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const chartData = data.map((d) => ({
    month: d.month,
    amount: d.totalTry,
  }));

  return (
    <Card className="shadow-sm transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Aylık Gider Grafiği</CardTitle>
        <p className="text-xs text-muted-foreground">
          Tüm para birimleri TL karşılığına çevrilmiştir
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[260px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                className="text-xs"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis className="text-xs" tick={{ fontSize: 11 }} width={48} />
              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value ?? 0), "TRY"),
                  "Gider (TL)",
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Bar
                dataKey="amount"
                fill="hsl(var(--primary))"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
