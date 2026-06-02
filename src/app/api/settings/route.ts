import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import {
  getNotificationEmail,
  getDefaultAdminEmail,
  setNotificationEmail,
} from "@/lib/settings";
import { settingsUpdateSchema } from "@/lib/validators/notification";
import { ZodError } from "zod";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const notificationEmail = await getNotificationEmail();
  const defaultEmail = await getDefaultAdminEmail();

  return NextResponse.json({
    notificationEmail,
    defaultEmail,
  });
}

export async function PATCH(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { notificationEmail } = settingsUpdateSchema.parse(body);
    await setNotificationEmail(notificationEmail);

    return NextResponse.json({ notificationEmail });
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        { error: "Geçersiz e-posta adresi" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
