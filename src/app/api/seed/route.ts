import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  try {
    // First, try to run migrations
    try {
      await execAsync("npx prisma migrate deploy", {
        env: { ...process.env },
        timeout: 60000,
      });
    } catch (migErr) {
      console.log("Migration attempt result:", migErr);
    }

    // Also try db push as fallback
    try {
      await execAsync("npx prisma db push --skip-generate", {
        env: { ...process.env },
        timeout: 60000,
      });
    } catch (pushErr) {
      console.log("DB push attempt result:", pushErr);
    }

    // Now create admin user
    const passwordHash = await bcrypt.hash("admin123", 10);

    const admin = await prisma.user.upsert({
      where: { username: "admin" },
      update: { passwordHash },
      create: {
        username: "admin",
        passwordHash,
        name: "Admin",
        email: "ezekielbora12@gmail.com",
        role: "ADMIN",
      },
    });

    // Create default categories
    const categories = [
      { name: "Yemek", color: "#ef4444", icon: "utensils" },
      { name: "Ulaşım", color: "#3b82f6", icon: "car" },
      { name: "Faturalar", color: "#f59e0b", icon: "receipt" },
      { name: "Eğlence", color: "#8b5cf6", icon: "gamepad-2" },
    ];

    for (const cat of categories) {
      await prisma.category.upsert({
        where: {
          userId_name: { userId: admin.id, name: cat.name },
        },
        update: {},
        create: {
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          userId: admin.id,
        },
      });
    }

    return NextResponse.json({
      status: "ok",
      message: "Admin user created/updated successfully",
      user: {
        username: admin.username,
        role: admin.role,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Seed failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
