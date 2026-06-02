"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { NotificationTable } from "@/components/notifications/notification-table";
import { NotificationFilters } from "@/components/notifications/notification-filters";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { NotificationLogItem } from "@/types";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("all");

  const fetchNotifications = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    if (status !== "all") params.set("status", status);

    fetch(`/api/notifications?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.data || []);
        setTotal(data.total ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [dateFrom, dateTo, status]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <>
      <Header
        title="Bildirimler"
        description="Gönderilen e-posta bildirimlerinin geçmişi"
      />
      <div className="space-y-6 p-4 sm:p-6">
        <NotificationFilters
          dateFrom={dateFrom}
          dateTo={dateTo}
          status={status}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onStatusChange={setStatus}
        />

        {loading ? (
          <LoadingSpinner />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Henüz bildirim yok"
            description="SMTP üzerinden gönderilen e-postalar burada listelenecek."
          />
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {total} bildirim gösteriliyor
            </p>
            <div className="rounded-lg border bg-card">
              <NotificationTable notifications={notifications} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
