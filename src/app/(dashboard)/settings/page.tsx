"use client";

import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Bell, Mail, Shield } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [testEmail, setTestEmail] = useState(
    session?.user?.email || ""
  );
  const [notificationEmail, setNotificationEmail] = useState("");
  const [defaultEmail, setDefaultEmail] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setNotificationEmail(data.notificationEmail || "");
        setDefaultEmail(data.defaultEmail);
        setLoadingSettings(false);
      })
      .catch(() => setLoadingSettings(false));
  }, []);

  async function handleSaveNotificationEmail() {
    if (!notificationEmail) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Bildirim e-postası kaydedildi" });
        setNotificationEmail(data.notificationEmail);
      } else {
        toast({
          title: "Kaydedilemedi",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Hata oluştu", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleTestEmail() {
    if (!testEmail) return;
    setSending(true);
    try {
      const res = await fetch("/api/settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Test e-postası gönderildi" });
      } else {
        toast({
          title: "E-posta gönderilemedi",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Hata oluştu", variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Header title="Ayarlar" description="Hesap ve sistem ayarları" />
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Profil
            </CardTitle>
            <CardDescription>Hesap bilgileriniz (salt okunur)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Ad</Label>
                <p className="font-medium">{session?.user?.name || "—"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">E-posta</Label>
                <p className="font-medium">{session?.user?.email || "—"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Rol</Label>
                <Badge className="mt-1">{session?.user?.role || "USER"}</Badge>
              </div>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">
              Kayıt özelliği bulunmamaktadır. Yeni kullanıcılar yalnızca veritabanı
              seed ile oluşturulabilir. Varsayılan admin şifresini ilk girişten
              sonra değiştirmeniz önerilir.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Bildirim E-postası
            </CardTitle>
            <CardDescription>
              Abonelik hatırlatma bildirimlerinin gönderileceği e-posta adresi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notification-email">Bildirim e-posta adresi</Label>
              <Input
                id="notification-email"
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                placeholder={defaultEmail || "ornek@email.com"}
                disabled={loadingSettings}
              />
              {defaultEmail && (
                <p className="text-xs text-muted-foreground">
                  Varsayılan: {defaultEmail}
                </p>
              )}
            </div>
            <Button
              onClick={handleSaveNotificationEmail}
              disabled={saving || !notificationEmail || loadingSettings}
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              SMTP Test
            </CardTitle>
            <CardDescription>
              Abonelik hatırlatma e-postaları için SMTP bağlantısını test edin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Test e-posta adresi</Label>
              <Input
                id="test-email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="ornek@email.com"
              />
            </div>
            <Button onClick={handleTestEmail} disabled={sending || !testEmail}>
              {sending ? "Gönderiliyor..." : "Test E-postası Gönder"}
            </Button>
            <p className="text-xs text-muted-foreground">
              SMTP: smtp.gmail.com:587 — Cron endpoint: POST
              /api/cron/subscription-reminders (Authorization: Bearer CRON_SECRET)
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
