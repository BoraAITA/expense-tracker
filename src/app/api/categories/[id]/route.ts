import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { categoryUpdateSchema } from "@/lib/validators/category";
import { ZodError } from "zod";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const data = categoryUpdateSchema.parse(body);

    const existing = await prisma.category.findFirst({
      where: { id: params.id, userId: session!.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.icon !== undefined && { icon: data.icon }),
      },
      include: { _count: { select: { expenses: true } } },
    });

    return NextResponse.json({
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      _count: category._count,
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const existing = await prisma.category.findFirst({
    where: { id: params.id, userId: session!.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.expense.updateMany({
      where: { categoryId: params.id },
      data: { categoryId: null },
    }),
    prisma.category.delete({ where: { id: params.id } }),
  ]);

  return NextResponse.json({ success: true });
}
