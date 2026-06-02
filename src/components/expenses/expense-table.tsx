"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ExpenseWithCategory } from "@/types";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import { useToast } from "@/hooks/use-toast";
import { Receipt } from "lucide-react";

interface ExpenseTableProps {
  expenses: ExpenseWithCategory[];
  onDeleted: () => void;
}

export function ExpenseTable({ expenses, onDeleted }: ExpenseTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/expenses/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Gider silindi" });
      onDeleted();
    } catch {
      toast({ title: "Silme başarısız", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  if (expenses.length === 0) {
    return (
      <EmptyState
        title="Gider bulunamadı"
        icon={Receipt}
      />
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <ResponsiveTable>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Para Birimi</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
                <TableHead className="w-[100px]">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow
                  key={expense.id}
                  className="transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{expense.title}</TableCell>
                  <TableCell>
                    {expense.category ? (
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: expense.category.color,
                          color: expense.category.color,
                        }}
                      >
                        {expense.category.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(expense.date)}</TableCell>
                  <TableCell>{expense.currency}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(expense.amount, expense.currency)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="min-h-10 min-w-10"
                        asChild
                      >
                        <Link href={`/expenses/${expense.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="min-h-10 min-w-10"
                        onClick={() => setDeleteId(expense.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ResponsiveTable>
      </div>

      {/* Mobile card view */}
      <div className="space-y-3 md:hidden">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium">{expense.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDate(expense.date)}
                </p>
                {expense.category && (
                  <Badge
                    variant="outline"
                    className="mt-2"
                    style={{
                      borderColor: expense.category.color,
                      color: expense.category.color,
                    }}
                  >
                    {expense.category.name}
                  </Badge>
                )}
              </div>
              <p className="shrink-0 text-lg font-bold">
                {formatCurrency(expense.amount, expense.currency)}
              </p>
            </div>
            <div className="mt-3 flex gap-2 border-t pt-3">
              <Button variant="outline" size="sm" className="min-h-10 flex-1" asChild>
                <Link href={`/expenses/${expense.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Düzenle
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="min-h-10 min-w-10"
                onClick={() => setDeleteId(expense.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Gideri sil"
        description="Bu gideri silmek istediğinize emin misiniz?"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
