import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSubscriptionReminder } from "@/lib/mail";
import { getNotificationEmail } from "@/lib/settings";
import { decimalToNumber, formatCurrency, parseCurrency } from "@/lib/utils";
import { addDays } from "date-fns";

const intervalLabels: Record<string, string> = {
  MONTHLY: "Aylık",
  YEARLY: "Yıllık",
  WEEKLY: "Haftalık",
};

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const notificationEmail = await getNotificationEmail();
  if (!notificationEmail) {
    return NextResponse.json(
      { error: "Bildirim e-postası yapılandırılmamış" },
      { status: 400 }
    );
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    include: { user: true },
  });

  let sent = 0;
  let skipped = 0;

  for (const sub of subscriptions) {
    const reminderDate = addDays(today, sub.reminderDays);
    const dueDate = new Date(sub.nextDueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate > reminderDate) {
      skipped++;
      continue;
    }

    const success = await sendSubscriptionReminder(notificationEmail, {
      name: sub.name,
      amount: formatCurrency(
        decimalToNumber(sub.amount),
        parseCurrency(sub.currency)
      ),
      nextDueDate: sub.nextDueDate,
      interval: intervalLabels[sub.interval] || sub.interval,
    });

    if (success) sent++;
    else skipped++;
  }

  return NextResponse.json({ sent, skipped, total: subscriptions.length });
}
