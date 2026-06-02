"use client";

import { DataTable, Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { NotificationLogItem } from "@/types";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface NotificationTableProps {
  notifications: NotificationLogItem[];
}

const columns: Column<NotificationLogItem>[] = [
  {
    key: "sentAt",
    header: "Tarih",
    cell: (row) =>
      format(new Date(row.sentAt), "d MMM yyyy HH:mm", { locale: tr }),
  },
  {
    key: "to",
    header: "Alıcı",
    cell: (row) => <span className="font-mono text-sm">{row.to}</span>,
  },
  {
    key: "subject",
    header: "Konu",
    cell: (row) => row.subject,
  },
  {
    key: "status",
    header: "Durum",
    cell: (row) => (
      <Badge variant={row.status === "SENT" ? "default" : "destructive"}>
        {row.status === "SENT" ? "Gönderildi" : "Başarısız"}
      </Badge>
    ),
  },
  {
    key: "error",
    header: "Hata",
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {row.error || "—"}
      </span>
    ),
  },
];

export function NotificationTable({ notifications }: NotificationTableProps) {
  return (
    <DataTable
      columns={columns}
      data={notifications}
      keyExtractor={(row) => row.id}
    />
  );
}
