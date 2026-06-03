import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import JSZip from "jszip";
import { readdir, stat, readFile } from "fs/promises";
import path from "path";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    if (session!.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetki yok" }, { status: 403 });
    }

    const [categories, expenses, subscriptions, settings, notificationLogs] =
      await Promise.all([
        prisma.category.findMany({
          include: { user: { select: { id: true, username: true } } },
        }),
        prisma.expense.findMany({
          include: {
            category: { select: { id: true, name: true } },
            user: { select: { id: true, username: true } },
          },
        }),
        prisma.subscription.findMany({
          include: { user: { select: { id: true, username: true } } },
        }),
        prisma.setting.findMany(),
        prisma.notificationLog.findMany(),
      ]);

    // Collect upload files
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    let uploadFiles: string[] = [];
    try {
      uploadFiles = await readdir(uploadsDir);
    } catch {
      // No uploads directory
    }

    // Create zip with JSZip
    const zip = new JSZip();

    // Add data.json
    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      source: "expense-tracker",
      data: {
        categories: categories.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        })),
        expenses: expenses.map((e) => ({
          ...e,
          amount: Number(e.amount),
          date: e.date.toISOString(),
          createdAt: e.createdAt.toISOString(),
          updatedAt: e.updatedAt.toISOString(),
        })),
        subscriptions: subscriptions.map((s) => ({
          ...s,
          amount: Number(s.amount),
          nextDueDate: s.nextDueDate.toISOString(),
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
        })),
        settings: settings.map((s) => ({
          ...s,
          updatedAt: s.updatedAt.toISOString(),
        })),
        notificationLogs: notificationLogs.map((n) => ({
          ...n,
          sentAt: n.sentAt.toISOString(),
        })),
      },
    };

    zip.file("data.json", JSON.stringify(exportData, null, 2));

    // Add upload images
    let imageCount = 0;
    for (const file of uploadFiles) {
      try {
        const filePath = path.join(uploadsDir, file);
        const fileStat = await stat(filePath);
        if (fileStat.isFile()) {
          const buffer = await readFile(filePath);
          zip.file(`uploads/${file}`, buffer);
          imageCount++;
        }
      } catch {
        // Skip inaccessible files
      }
    }

    // Generate zip as base64
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
    const base64 = zipBuffer.toString("base64");
    const filename = `expense-tracker-backup-${new Date().toISOString().slice(0, 10)}.zip`;

    return NextResponse.json({
      success: true,
      filename,
      size: zipBuffer.length,
      data: base64,
      stats: {
        categories: categories.length,
        expenses: expenses.length,
        subscriptions: subscriptions.length,
        settings: settings.length,
        notificationLogs: notificationLogs.length,
        images: imageCount,
      },
    });
  } catch {
    return NextResponse.json({ error: "Dışa aktarma başarısız" }, { status: 500 });
  }
}
