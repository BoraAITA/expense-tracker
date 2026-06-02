"use client";

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
import { SubscriptionItem } from "@/types";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SubscriptionForm } from "./subscription-form";
import { SubscriptionLogo } from "@/components/shared/subscription-logo";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import { useToast } from "@/hooks/use-toast";
import { Repeat } from "lucide-react";

const intervalLabels: Record<string, string> = {
  MONTHLY: "Aylık",
  YEARLY: "Yıllık",
  WEEKLY: "Haftalık",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Aktif",
  PAUSED: "Duraklatıldı",
  CANCELLED: "İptal",
};

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  PAUSED: "secondary",
  CANCELLED: "destructive",
};

interface SubscriptionTableProps {
  subscriptions: SubscriptionItem[];
  onChanged: () => void;
}

export function SubscriptionTable({
  subscriptions,
  onChanged,
}: SubscriptionTableProps) {
  const [editSub, setEditSub] = useState<SubscriptionItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/subscriptions/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast({ title: "Abonelik silindi" });
      onChanged();
    } catch {
      toast({ title: "Silme başarısız", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  if (subscriptions.length === 0) {
    return (
      <EmptyState
        title="Abonelik yok"
        description="Yeni abonelik ekleyerek başlayın."
        icon={Repeat}
      />
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <ResponsiveTable>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12" />
                <TableHead>İsim</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Periyot</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Sonraki ödeme</TableHead>
                <TableHead className="w-[100px]">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow
                  key={sub.id}
                  className="transition-colors hover:bg-muted/50"
                >
                  <TableCell>
                    <SubscriptionLogo
                      name={sub.name}
                      logoUrl={sub.logoUrl}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{sub.name}</TableCell>
                  <TableCell>
                    {formatCurrency(sub.amount, sub.currency)}
                  </TableCell>
                  <TableCell>
                    {intervalLabels[sub.interval] || sub.interval}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[sub.status] || "secondary"}>
                      {statusLabels[sub.status] || sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(sub.nextDueDate)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="min-h-10 min-w-10"
                        onClick={() => setEditSub(sub)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="min-h-10 min-w-10"
                        onClick={() => setDeleteId(sub.id)}
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

      <div className="space-y-3 md:hidden">
        {subscriptions.map((sub) => (
          <div
            key={sub.id}
            className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <SubscriptionLogo
                name={sub.name}
                logoUrl={sub.logoUrl}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{sub.name}</p>
                <p className="text-lg font-bold">
                  {formatCurrency(sub.amount, sub.currency)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {intervalLabels[sub.interval]} · {formatDate(sub.nextDueDate)}
                </p>
              </div>
              <Badge variant={statusVariant[sub.status] || "secondary"}>
                {statusLabels[sub.status]}
              </Badge>
            </div>
            <div className="mt-3 flex gap-2 border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                className="min-h-10 flex-1"
                onClick={() => setEditSub(sub)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Düzenle
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="min-h-10 min-w-10"
                onClick={() => setDeleteId(sub.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <SubscriptionForm
        open={!!editSub}
        onOpenChange={(open) => !open && setEditSub(null)}
        subscription={editSub}
        onSaved={() => {
          onChanged();
          setEditSub(null);
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Aboneliği sil"
        description="Bu aboneliği silmek istediğinize emin misiniz?"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
