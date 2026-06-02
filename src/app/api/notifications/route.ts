import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { notificationQuerySchema } from "@/lib/validators/notification";
import { ZodError } from "zod";
import type { NotificationStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const query = notificationQuerySchema.parse(params);

    const where: {
      sentAt?: { gte?: Date; lte?: Date };
      status?: NotificationStatus;
    } = {};

    if (query.from || query.to) {
      where.sentAt = {};
      if (query.from) {
        const from = new Date(query.from);
        from.setHours(0, 0, 0, 0);
        where.sentAt.gte = from;
      }
      if (query.to) {
        const to = new Date(query.to);
        to.setHours(23, 59, 59, 999);
        where.sentAt.lte = to;
      }
    }

    if (query.status && query.status !== "all") {
      where.status = query.status;
    }

    const skip = (query.page - 1) * query.limit;

    const [logs, total] = await Promise.all([
      prisma.notificationLog.findMany({
        where,
        orderBy: { sentAt: "desc" },
        skip,
        take: query.limit,
      }),
      prisma.notificationLog.count({ where }),
    ]);

    return NextResponse.json({
      data: logs.map((log) => ({
        id: log.id,
        to: log.to,
        subject: log.subject,
        status: log.status,
        sentAt: log.sentAt.toISOString(),
        error: log.error,
      })),
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
