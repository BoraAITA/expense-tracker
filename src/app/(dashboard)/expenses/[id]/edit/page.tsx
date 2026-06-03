"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import type { CurrencyCode } from "@/lib/currency";

export default function EditExpensePage({
  params,
}: {
  params: { id: string };
}) {
  const [data, setData] = useState<{
    title: string;
    amount: number;
    currency: CurrencyCode;
    description?: string | null;
    date: string;
    categoryId?: string | null;
    installmentTotal?: number | null;
    installmentCurrent?: number | null;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/expenses/${params.id}`)
      .then((res) => res.json())
      .then(setData);
  }, [params.id]);

  if (!data) {
    return (
      <>
        <Header title="Gider Düzenle" />
        <div className="p-4 sm:p-6">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Gider Düzenle" description={data.title} />
      <div className="p-4 sm:p-6">
        <ExpenseForm expenseId={params.id} initialData={data} />
      </div>
    </>
  );
}
