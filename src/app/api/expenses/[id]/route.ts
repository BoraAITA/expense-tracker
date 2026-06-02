import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { expenseUpdateSchema } from "@/lib/validators/expense";
import { serializeExpenseWithCategory } from "@/lib/dashboard-stats";
import { ZodError } from "zod";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const expense = await prisma.expense.findFirst({
    where: { id: params.id, userId: session!.user.id },
    include: { category: true },
  });

  if (!expense) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(serializeExpenseWithCategory(expense));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const data = expenseUpdateSchema.parse(body);

    const existing = await prisma.expense.findFirst({
      where: { id: params.id, userId: session!.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (data.categoryId) {
      const cat = await prisma.category.findFirst({
        where: { id: data.categoryId, userId: session!.user.id },
      });
      if (!cat) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
    }

    const expense = await prisma.expense.update({
      where: { id: params.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      },
      include: { category: true },
    });

    return NextResponse.json(serializeExpenseWithCategory(expense));
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

  const existing = await prisma.expense.findFirst({
    where: { id: params.id, userId: session!.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.expense.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
