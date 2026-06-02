"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubscriptionItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SubscriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: SubscriptionItem | null;
  onSaved: () => void;
}

export function SubscriptionForm({
  open,
  onOpenChange,
  subscription,
  onSaved,
}: SubscriptionFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [interval, setInterval] = useState("MONTHLY");
  const [status, setStatus] = useState("ACTIVE");
  const [nextDueDate, setNextDueDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [reminderDays, setReminderDays] = useState("3");

  useEffect(() => {
    if (subscription) {
      setName(subscription.name);
      setAmount(subscription.amount.toString());
      setInterval(subscription.interval);
      setStatus(subscription.status);
      setNextDueDate(
        format(new Date(subscription.nextDueDate), "yyyy-MM-dd")
      );
      setReminderDays(subscription.reminderDays.toString());
    } else {
      setName("");
      setAmount("");
      setInterval("MONTHLY");
      setStatus("ACTIVE");
      setNextDueDate(format(new Date(), "yyyy-MM-dd"));
      setReminderDays("3");
    }
  }, [subscription, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const body = {
      name,
      amount: parseFloat(amount),
      interval,
      status,
      nextDueDate: new Date(nextDueDate).toISOString(),
      reminderDays: parseInt(reminderDays, 10),
    };

    try {
      const url = subscription
        ? `/api/subscriptions/${subscription.id}`
        : "/api/subscriptions";
      const method = subscription ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();
      toast({
        title: subscription ? "Abonelik güncellendi" : "Abonelik eklendi",
      });
      onSaved();
      onOpenChange(false);
    } catch {
      toast({ title: "İşlem başarısız", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {subscription ? "Abonelik Düzenle" : "Yeni Abonelik"}
          </SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sub-name">İsim</Label>
            <Input
              id="sub-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sub-amount">Tutar (₺)</Label>
            <Input
              id="sub-amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Periyot</Label>
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEEKLY">Haftalık</SelectItem>
                <SelectItem value="MONTHLY">Aylık</SelectItem>
                <SelectItem value="YEARLY">Yıllık</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Durum</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Aktif</SelectItem>
                <SelectItem value="PAUSED">Duraklatıldı</SelectItem>
                <SelectItem value="CANCELLED">İptal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sub-due">Sonraki ödeme</Label>
            <Input
              id="sub-due"
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sub-reminder">Hatırlatma (gün önce)</Label>
            <Input
              id="sub-reminder"
              type="number"
              min="0"
              max="30"
              value={reminderDays}
              onChange={(e) => setReminderDays(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
