import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { expenseCreateSchema, expenseQuerySchema } from "@/lib/validators/expense";
import { serializeExpenseWithCategory } from "@/lib/dashboard-stats";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const query = expenseQuerySchema.parse(params);
    const userId = session!.user.id;

    const where: {
      userId: string;
      title?: { contains: string; mode: "insensitive" };
      categoryId?: string;
      date?: { gte?: Date; lte?: Date };
    } = { userId };

    if (query.search) {
      where.title = { contains: query.search, mode: "insensitive" };
    }
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.from || query.to) {
      where.date = {};
      if (query.from) where.date.gte = new Date(query.from);
      if (query.to) where.date.lte = new Date(query.to);
    }

    const skip = (query.page - 1) * query.limit;

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: { category: true },
        orderBy: { date: "desc" },
        skip,
        take: query.limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return NextResponse.json({
      data: expenses.map(serializeExpenseWithCategory),
      total,
      page: query.page,
      limit: query.limit,
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

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const data = expenseCreateSchema.parse(body);
    const userId = session!.user.id;

    if (data.categoryId) {
      const cat = await prisma.category.findFirst({
        where: { id: data.categoryId, userId },
      });
      if (!cat) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
    }

    const expense = await prisma.expense.create({
      data: {
        title: data.title,
        amount: data.amount,
        currency: data.currency,
        description: data.description ?? null,
        date: data.date,
        categoryId: data.categoryId ?? null,
        installmentTotal: data.installmentTotal ?? null,
        installmentCurrent: data.installmentCurrent ?? null,
        userId,
      },
      include: { category: true },
    });

    return NextResponse.json(serializeExpenseWithCategory(expense), {
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
