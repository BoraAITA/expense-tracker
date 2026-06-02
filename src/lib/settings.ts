import { prisma } from "@/lib/prisma";

export const NOTIFICATION_EMAIL_KEY = "notification_email";

export async function getDefaultAdminEmail(): Promise<string | null> {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    select: { email: true },
  });
  return admin?.email ?? null;
}

export async function getNotificationEmail(): Promise<string | null> {
  const setting = await prisma.setting.findUnique({
    where: { key: NOTIFICATION_EMAIL_KEY },
  });

  if (setting?.value) {
    return setting.value;
  }

  return getDefaultAdminEmail();
}

export async function setNotificationEmail(email: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key: NOTIFICATION_EMAIL_KEY },
    update: { value: email },
    create: { key: NOTIFICATION_EMAIL_KEY, value: email },
  });
}
