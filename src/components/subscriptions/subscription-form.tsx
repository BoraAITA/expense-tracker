"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
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
import { CurrencySelect } from "@/components/shared/currency-select";
import { SubscriptionLogo } from "@/components/shared/subscription-logo";
import { SubscriptionItem } from "@/types";
import type { CurrencyCode } from "@/lib/currency";
import { CURRENCY_SYMBOLS } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Upload, X, Loader2 } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("TRY");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
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
      setCurrency(subscription.currency);
      setLogoUrl(subscription.logoUrl);
      setInterval(subscription.interval);
      setStatus(subscription.status);
      setNextDueDate(
        format(new Date(subscription.nextDueDate), "yyyy-MM-dd")
      );
      setReminderDays(subscription.reminderDays.toString());
    } else {
      setName("");
      setAmount("");
      setCurrency("TRY");
      setLogoUrl(null);
      setInterval("MONTHLY");
      setStatus("ACTIVE");
      setNextDueDate(format(new Date(), "yyyy-MM-dd"));
      setReminderDays("3");
    }
  }, [subscription, open]);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      const { url } = await res.json();
      setLogoUrl(url);
      toast({ title: "Logo yüklendi" });
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Yükleme başarısız",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const body = {
      name,
      amount: parseFloat(amount),
      currency,
      logoUrl,
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
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {subscription ? "Abonelik Düzenle" : "Yeni Abonelik"}
          </SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border shadow-sm">
                  <Image
                    src={logoUrl}
                    alt="Logo önizleme"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <SubscriptionLogo name={name || "Abonelik"} size="lg" />
              )}
              <div className="flex flex-1 flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-10"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Logo yükle
                </Button>
                {logoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="min-h-9 text-destructive"
                    onClick={() => setLogoUrl(null)}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Kaldır
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sub-name">İsim</Label>
            <Input
              id="sub-name"
              className="min-h-11"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sub-amount">
                Tutar ({CURRENCY_SYMBOLS[currency]})
              </Label>
              <Input
                id="sub-amount"
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
            <Label>Periyot</Label>
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger className="min-h-11">
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
              <SelectTrigger className="min-h-11">
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
              className="min-h-11"
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
              className="min-h-11"
              value={reminderDays}
              onChange={(e) => setReminderDays(e.target.value)}
            />
          </div>
          <Button type="submit" className="min-h-11 w-full" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
