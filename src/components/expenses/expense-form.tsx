"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CurrencySelect } from "@/components/shared/currency-select";
import { CategoryItem } from "@/types";
import type { CurrencyCode } from "@/lib/currency";
import { CURRENCY_SYMBOLS } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ExpenseFormProps {
  expenseId?: string;
  initialData?: {
    title: string;
    amount: number;
    currency?: CurrencyCode;
    description?: string | null;
    date: string;
    categoryId?: string | null;
  };
}

export function ExpenseForm({ expenseId, initialData }: ExpenseFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initialData?.title || "");
  const [amount, setAmount] = useState(
    initialData?.amount?.toString() || ""
  );
  const [currency, setCurrency] = useState<CurrencyCode>(
    initialData?.currency || "TRY"
  );
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [date, setDate] = useState(
    initialData?.date
      ? format(new Date(initialData.date), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd")
  );
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId || "none"
  );

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const body = {
      title,
      amount: parseFloat(amount),
      currency,
      description: description || null,
      date: new Date(date).toISOString(),
      categoryId: categoryId === "none" ? null : categoryId,
    };

    try {
      const url = expenseId ? `/api/expenses/${expenseId}` : "/api/expenses";
      const method = expenseId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }

      toast({
        title: expenseId ? "Gider güncellendi" : "Gider eklendi",
      });
      router.push("/expenses");
      router.refresh();
    } catch {
      toast({ title: "İşlem başarısız", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-lg space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık</Label>
            <Input
              id="title"
              className="min-h-11"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">
                Tutar ({CURRENCY_SYMBOLS[currency]})
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                className="min-h-11"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <CurrencySelect value={currency} onChange={setCurrency} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Tarih</Label>
            <Input
              id="date"
              type="date"
              className="min-h-11"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="min-h-11">
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kategorisiz</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" className="min-h-11 flex-1" disabled={loading}>
              {loading ? "Kaydediliyor..." : expenseId ? "Güncelle" : "Kaydet"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => router.back()}
            >
              İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
