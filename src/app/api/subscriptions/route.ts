import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { subscriptionCreateSchema } from "@/lib/validators/subscription";
import { serializeSubscription } from "@/lib/dashboard-stats";
import { ZodError } from "zod";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session!.user.id },
    orderBy: { nextDueDate: "asc" },
  });

  return NextResponse.json(subscriptions.map(serializeSubscription));
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const data = subscriptionCreateSchema.parse(body);

    const subscription = await prisma.subscription.create({
      data: {
        name: data.name,
        amount: data.amount,
        currency: data.currency,
        logoUrl: data.logoUrl ?? null,
        interval: data.interval,
        status: data.status,
        nextDueDate: data.nextDueDate,
        reminderDays: data.reminderDays,
        userId: session!.user.id,
      },
    });

    return NextResponse.json(serializeSubscription(subscription), {
      status: 201,
    });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: e.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
