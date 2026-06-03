import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import bcrypt from "bcryptjs";

export async function PATCH(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const userId = session!.user.id;
    const updates: Record<string, string> = {};

    // Name update
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.length < 1 || body.name.length > 100) {
        return NextResponse.json({ error: "Geçersiz isim" }, { status: 400 });
      }
      updates.name = body.name.trim();
    }

    // Email update
    if (body.email !== undefined) {
      if (typeof body.email !== "string" || !body.email.includes("@")) {
        return NextResponse.json({ error: "Geçersiz e-posta adresi" }, { status: 400 });
      }
      // Check if email is already taken by another user
      const existing = await prisma.user.findFirst({
        where: { email: body.email.trim(), NOT: { id: userId } },
      });
      if (existing) {
        return NextResponse.json({ error: "Bu e-posta adresi zaten kullanımda" }, { status: 409 });
      }
      updates.email = body.email.trim();
    }

    // Username update
    if (body.username !== undefined) {
      if (typeof body.username !== "string" || body.username.length < 3) {
        return NextResponse.json({ error: "Kullanıcı adı en az 3 karakter olmalı" }, { status: 400 });
      }
      const existing = await prisma.user.findFirst({
        where: { username: body.username.trim(), NOT: { id: userId } },
      });
      if (existing) {
        return NextResponse.json({ error: "Bu kullanıcı adı zaten alınmış" }, { status: 409 });
      }
      updates.username = body.username.trim();
    }

    // Password update
    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json({ error: "Mevcut şifrenizi girin" }, { status: 400 });
      }
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
      }
      const valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Mevcut şifre yanlış" }, { status: 403 });
      }
      if (body.newPassword.length < 6) {
        return NextResponse.json({ error: "Yeni şifre en az 6 karakter olmalı" }, { status: 400 });
      }
      updates.passwordHash = await bcrypt.hash(body.newPassword, 10);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Güncellenecek alan yok" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: { id: true, name: true, email: true, username: true, role: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
