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

  console.log("Seed completed: admin user and sample data ready");
}

main()
  .catch((e) => {
    console.error("SEED ERROR:", e);
    process.exit(0); // don't fail the container
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
