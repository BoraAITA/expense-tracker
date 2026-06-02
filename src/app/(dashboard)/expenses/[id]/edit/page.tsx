"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function EditExpensePage({
  params,
}: {
  params: { id: string };
}) {
  const [data, setData] = useState<{
    title: string;
    amount: number;
    description?: string | null;
    date: string;
    categoryId?: string | null;
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
        <LoadingSpinner />
      </>
    );
  }

  return (
    <>
      <Header title="Gider Düzenle" description={data.title} />
      <div className="p-6">
        <ExpenseForm expenseId={params.id} initialData={data} />
      </div>
    </>
  );
}
