import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import JSZip from "jszip";

interface ExportedData {
  version: string;
  exportedAt: string;
  source: string;
  data: {
    categories: Array<{
      id: string;
      name: string;
      color: string;
      icon: string | null;
      userId: string;
      createdAt: string;
      updatedAt: string;
    }>;
    expenses: Array<{
      id: string;
      title: string;
      amount: number;
      currency: string;
      description: string | null;
      date: string;
      installmentTotal: number | null;
      installmentCurrent: number | null;
      userId: string;
      categoryId: string | null;
      createdAt: string;
      updatedAt: string;
    }>;
    subscriptions: Array<{
      id: string;
      name: string;
      amount: number;
      currency: string;
      logoUrl: string | null;
      interval: string;
      status: string;
      nextDueDate: string;
      reminderDays: number;
      userId: string;
      createdAt: string;
      updatedAt: string;
    }>;
    settings: Array<{
      key: string;
      value: string;
      updatedAt: string;
    }>;
    notificationLogs: Array<{
      id: string;
      to: string;
      subject: string;
      body: string;
      status: string;
      sentAt: string;
      error: string | null;
    }>;
  };
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    if (session!.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetki yok" }, { status: 403 });
    }

    const formData = await request.json();
    const base64Data = formData.data;

    if (!base64Data) {
      return NextResponse.json({ error: "ZIP dosyası gerekli" }, { status: 400 });
    }

    const zipBuffer = Buffer.from(base64Data, "base64");
    const zip = await JSZip.loadAsync(zipBuffer);

    // Read data.json
    const dataFile = zip.file("data.json");
    if (!dataFile) {
      return NextResponse.json({ error: "ZIP içinde data.json bulunamadı" }, { status: 400 });
    }

    const dataContent = await dataFile.async("string");
    const exportData: ExportedData = JSON.parse(dataContent);

    if (exportData.source !== "expense-tracker") {
      return NextResponse.json({ error: "Geçersiz yedek dosyası" }, { status: 400 });
    }

    const userId = session!.user.id;
    const imported = { categories: 0, expenses: 0, subscriptions: 0, settings: 0, images: 0 };

    // 1. Extract images
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const imageFiles = zip.folder("uploads");
    if (imageFiles) {
      const entries: JSZip.JSZipObject[] = [];
      imageFiles.forEach((_path, file) => {
        if (!file.dir) entries.push(file);
      });
      for (const img of entries) {
        const filename = img.name.replace("uploads/", "");
        if (!filename) continue;
        const buffer = await img.async("nodebuffer");
        await writeFile(path.join(uploadsDir, filename), buffer);
        imported.images++;
      }
    }

    // 2. Import categories
    const oldToNewCategoryMap = new Map<string, string>();
    for (const cat of exportData.data.categories) {
      try {
        const created = await prisma.category.upsert({
          where: { userId_name: { userId, name: cat.name } },
          update: { color: cat.color, icon: cat.icon },
          create: { id: cat.id, name: cat.name, color: cat.color, icon: cat.icon, userId },
        });
        oldToNewCategoryMap.set(cat.id, created.id);
        imported.categories++;
      } catch {
        // Skip
      }
    }

    // 3. Import expenses
    for (const exp of exportData.data.expenses) {
      try {
        const categoryId = exp.categoryId ? oldToNewCategoryMap.get(exp.categoryId) || null : null;
        await prisma.expense.upsert({
          where: { id: exp.id },
          update: {
            title: exp.title,
            amount: exp.amount,
            currency: exp.currency as "TRY" | "USD" | "EUR",
            description: exp.description,
            date: new Date(exp.date),
            installmentTotal: exp.installmentTotal,
            installmentCurrent: exp.installmentCurrent,
            categoryId,
          },
          create: {
            id: exp.id,
            title: exp.title,
            amount: exp.amount,
            currency: exp.currency as "TRY" | "USD" | "EUR",
            description: exp.description,
            date: new Date(exp.date),
            installmentTotal: exp.installmentTotal,
            installmentCurrent: exp.installmentCurrent,
            categoryId,
            userId,
          },
        });
        imported.expenses++;
      } catch {
        // Skip
      }
    }

    // 4. Import subscriptions
    for (const sub of exportData.data.subscriptions) {
      try {
        let logoUrl = sub.logoUrl;
        if (logoUrl && logoUrl.startsWith("/uploads/")) {
          const filename = logoUrl.replace("/uploads/", "");
          const imgPath = path.join(uploadsDir, filename);
          try {
            const { access } = await import("fs/promises");
            await access(imgPath);
          } catch {
            logoUrl = null;
          }
        }

        await prisma.subscription.upsert({
          where: { id: sub.id },
          update: {
            name: sub.name,
            amount: sub.amount,
            currency: sub.currency as "TRY" | "USD" | "EUR",
            logoUrl,
            interval: sub.interval as "MONTHLY" | "YEARLY" | "WEEKLY",
            status: sub.status as "ACTIVE" | "PAUSED" | "CANCELLED",
            nextDueDate: new Date(sub.nextDueDate),
            reminderDays: sub.reminderDays,
          },
          create: {
            id: sub.id,
            name: sub.name,
            amount: sub.amount,
            currency: sub.currency as "TRY" | "USD" | "EUR",
            logoUrl,
            interval: sub.interval as "MONTHLY" | "YEARLY" | "WEEKLY",
            status: sub.status as "ACTIVE" | "PAUSED" | "CANCELLED",
            nextDueDate: new Date(sub.nextDueDate),
            reminderDays: sub.reminderDays,
            userId,
          },
        });
        imported.subscriptions++;
      } catch {
        // Skip
      }
    }

    // 5. Import settings (only notificationEmail)
    for (const setting of exportData.data.settings) {
      try {
        if (setting.key === "notificationEmail") {
          await prisma.setting.upsert({
            where: { key: setting.key },
            update: { value: setting.value },
            create: { key: setting.key, value: setting.value },
          });
          imported.settings++;
        }
      } catch {
        // Skip
      }
    }

    return NextResponse.json({ success: true, message: "İçe aktarma başarılı", imported });
  } catch (err) {
    return NextResponse.json(
      { error: "İçe aktarma başarısız", details: err instanceof Error ? err.message : "Bilinmeyen hata" },
      { status: 500 }
    );
  }
}
