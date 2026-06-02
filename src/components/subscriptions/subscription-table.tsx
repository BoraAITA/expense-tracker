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
import { useToast } from "@/hooks/use-toast";

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
      />
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
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
            <TableRow key={sub.id}>
              <TableCell className="font-medium">{sub.name}</TableCell>
              <TableCell>{formatCurrency(sub.amount)}</TableCell>
              <TableCell>{intervalLabels[sub.interval] || sub.interval}</TableCell>
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
                    onClick={() => setEditSub(sub)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
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
