import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash,
      name: "Admin",
      email: "ezekielbora12@gmail.com",
      role: "ADMIN",
    },
  });

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

  const existingExpenses = await prisma.expense.count({
    where: { userId: admin.id },
  });

  if (existingExpenses === 0) {
    const foodCategory = await prisma.category.findFirst({
      where: { userId: admin.id, name: "Yemek" },
    });

    await prisma.expense.createMany({
      data: [
        {
          title: "Market alışverişi",
          amount: 450.5,
          currency: "TRY",
          description: "Haftalık market",
          date: new Date(),
          userId: admin.id,
          categoryId: foodCategory?.id,
        },
        {
          title: "Elektrik faturası",
          amount: 320,
          currency: "TRY",
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          userId: admin.id,
        },
      ],
    });
  }

  const existingSubs = await prisma.subscription.count({
    where: { userId: admin.id },
  });

  if (existingSubs === 0) {
    await prisma.subscription.create({
      data: {
        name: "Netflix",
        amount: 149.99,
        currency: "TRY",
        interval: "MONTHLY",
        status: "ACTIVE",
        nextDueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        reminderDays: 3,
        userId: admin.id,
      },
    });
  }

  if (admin.email) {
    await prisma.setting.upsert({
      where: { key: "notification_email" },
      update: {},
      create: {
        key: "notification_email",
        value: admin.email,
      },
    });
  }

  console.log("Seed completed: admin user and sample data ready");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
