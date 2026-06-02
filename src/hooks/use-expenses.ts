"use client";

import { useState, useEffect, useCallback } from "react";
import { ExpenseWithCategory } from "@/types";

interface UseExpensesOptions {
  search?: string;
  categoryId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export function useExpenses(options: UseExpensesOptions = {}) {
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (options.search) params.set("search", options.search);
    if (options.categoryId) params.set("categoryId", options.categoryId);
    if (options.from) params.set("from", options.from);
    if (options.to) params.set("to", options.to);
    if (options.page) params.set("page", String(options.page));
    if (options.limit) params.set("limit", String(options.limit));

    try {
      const res = await fetch(`/api/expenses?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setExpenses(data.data);
      setTotal(data.total);
    } catch {
      setError("Giderler yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [options.search, options.categoryId, options.from, options.to, options.page, options.limit]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return { expenses, total, loading, error, refetch: fetchExpenses };
}
