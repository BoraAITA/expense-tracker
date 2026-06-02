"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ExpenseFilters } from "@/components/expenses/expense-filters";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useExpenses } from "@/hooks/use-expenses";
import { CategoryItem } from "@/types";

export default function ExpensesPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  const { expenses, loading, refetch } = useExpenses({
    search: debouncedSearch || undefined,
    categoryId: categoryId !== "all" ? categoryId : undefined,
  });

  return (
    <>
      <Header
        title="Giderler"
        description="Tüm giderlerinizi yönetin"
        action={
          <Button asChild>
            <Link href="/expenses/new">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Gider
            </Link>
          </Button>
        }
      />
      <div className="flex-1 space-y-6 p-6">
        <ExpenseFilters
          search={search}
          onSearchChange={setSearch}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          categories={categories}
        />
        {loading ? (
          <LoadingSpinner />
        ) : (
          <ExpenseTable expenses={expenses} onDeleted={refetch} />
        )}
      </div>
    </>
  );
}
