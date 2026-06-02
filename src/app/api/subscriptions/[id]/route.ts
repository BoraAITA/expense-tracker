import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { subscriptionUpdateSchema } from "@/lib/validators/subscription";
import { decimalToNumber } from "@/lib/utils";
import { ZodError } from "zod";

function serialize(sub: {
  id: string;
  name: string;
  amount: { toString(): string };
  interval: string;
  status: string;
  nextDueDate: Date;
  reminderDays: number;
}) {
  return {
    id: sub.id,
    name: sub.name,
    amount: decimalToNumber(sub.amount),
    interval: sub.interval,
    status: sub.status,
    nextDueDate: sub.nextDueDate.toISOString(),
    reminderDays: sub.reminderDays,
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const data = subscriptionUpdateSchema.parse(body);

    const existing = await prisma.subscription.findFirst({
      where: { id: params.id, userId: session!.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const subscription = await prisma.subscription.update({
      where: { id: params.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.interval !== undefined && { interval: data.interval }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.nextDueDate !== undefined && { nextDueDate: data.nextDueDate }),
        ...(data.reminderDays !== undefined && { reminderDays: data.reminderDays }),
      },
    });

    return NextResponse.json(serialize(subscription));
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const existing = await prisma.subscription.findFirst({
    where: { id: params.id, userId: session!.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.subscription.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
