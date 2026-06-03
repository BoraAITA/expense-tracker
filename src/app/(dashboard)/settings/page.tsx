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
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Bell, Mail, User, Save, Lock, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();

  // Profile state
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Notification email state
  const [testEmail, setTestEmail] = useState(session?.user?.email || "");
  const [notificationEmail, setNotificationEmail] = useState("");
  const [defaultEmail, setDefaultEmail] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [savingNotification, setSavingNotification] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    setName(session?.user?.name || "");
    setEmail(session?.user?.email || "");
    setTestEmail(session?.user?.email || "");
  }, [session]);

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

  // Save profile (name + email)
  async function handleSaveProfile() {
    if (!name.trim()) {
      toast({ title: "İsim gerekli", variant: "destructive" });
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast({ title: "Geçerli bir e-posta girin", variant: "destructive" });
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        // Update the session so UI reflects changes
        await update({ name: data.name, email: data.email });
        toast({ title: "Profil güncellendi" });
      } else {
        toast({
          title: "Güncellenemedi",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Hata oluştu", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  }

  // Change password
  async function handleChangePassword() {
    if (!currentPassword) {
      toast({ title: "Mevcut şifrenizi girin", variant: "destructive" });
      return;
    }
    if (!newPassword) {
      toast({ title: "Yeni şifre girin", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Yeni şifre en az 6 karakter olmalı", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Şifreler eşleşmiyor", variant: "destructive" });
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast({ title: "Şifre güncellendi" });
      } else {
        toast({
          title: "Şifre güncellenemedi",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Hata oluştu", variant: "destructive" });
    } finally {
      setSavingPassword(false);
    }
  }

  // Save notification email
  async function handleSaveNotificationEmail() {
    if (!notificationEmail) return;
    setSavingNotification(true);
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
      setSavingNotification(false);
    }
  }

  // Test email
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
        {/* PROFILE CARD */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profil Bilgileri
            </CardTitle>
            <CardDescription>
              Kullanıcı adınızı ve e-posta adresinizi düzenleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="text-xs">
                {session?.user?.role || "USER"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                @
                {session?.user?.name?.toLowerCase().replace(/\s+/g, "") ||
                  "kullanici"}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-name">İsim</Label>
                <Input
                  id="profile-name"
                  className="min-h-11"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adınız"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">E-posta</Label>
                <Input
                  id="profile-email"
                  type="email"
                  className="min-h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                />
              </div>
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="min-h-11"
            >
              <Save className="mr-2 h-4 w-4" />
              {savingProfile ? "Kaydediliyor..." : "Profili Kaydet"}
            </Button>
          </CardContent>
        </Card>

        {/* PASSWORD CARD */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Şifre Değiştir
            </CardTitle>
            <CardDescription>
              Hesap güvenliğiniz için şifrenizi düzenleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Mevcut Şifre</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  className="min-h-11 pr-10"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">Yeni Şifre</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    className="min-h-11 pr-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Şifre Tekrar</Label>
                <Input
                  id="confirm-password"
                  type={showNewPassword ? "text" : "password"}
                  className="min-h-11"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Yeni şifre en az 6 karakter olmalıdır.
            </p>
            <Button
              onClick={handleChangePassword}
              disabled={savingPassword || !currentPassword || !newPassword}
              variant="outline"
              className="min-h-11"
            >
              <Lock className="mr-2 h-4 w-4" />
              {savingPassword ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </Button>
          </CardContent>
        </Card>

        {/* NOTIFICATION EMAIL CARD */}
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
                className="min-h-11"
              />
              {defaultEmail && (
                <p className="text-xs text-muted-foreground">
                  Varsayılan: {defaultEmail}
                </p>
              )}
            </div>
            <Button
              onClick={handleSaveNotificationEmail}
              disabled={savingNotification || !notificationEmail || loadingSettings}
              className="min-h-11"
            >
              <Save className="mr-2 h-4 w-4" />
              {savingNotification ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </CardContent>
        </Card>

        {/* SMTP TEST CARD */}
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
                className="min-h-11"
              />
            </div>
            <Button
              onClick={handleTestEmail}
              disabled={sending || !testEmail}
              variant="outline"
              className="min-h-11"
            >
              <Mail className="mr-2 h-4 w-4" />
              {sending ? "Gönderiliyor..." : "Test E-postası Gönder"}
            </Button>
            <p className="text-xs text-muted-foreground">
              SMTP: smtp.gmail.com:587 — Cron endpoint: POST
              /api/cron/subscription-reminders
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
