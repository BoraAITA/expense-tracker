import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { categoryCreateSchema } from "@/lib/validators/category";
import { ZodError } from "zod";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const categories = await prisma.category.findMany({
    where: { userId: session!.user.id },
    include: { _count: { select: { expenses: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(
    categories.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      icon: c.icon,
      _count: c._count,
    }))
  );
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const data = categoryCreateSchema.parse(body);

    const category = await prisma.category.create({
      data: {
        name: data.name,
        color: data.color,
        icon: data.icon ?? null,
        userId: session!.user.id,
      },
      include: { _count: { select: { expenses: true } } },
    });

    return NextResponse.json(
      {
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        _count: category._count,
      },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: e.issues },
        { status: 400 }
      );
    }
    if ((e as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
