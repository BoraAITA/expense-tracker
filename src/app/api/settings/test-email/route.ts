import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { sendTestEmail } from "@/lib/mail";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { email } = schema.parse(body);
    const success = await sendTestEmail(email);

    if (success) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({
      success: false,
      error: "SMTP yapılandırması eksik veya gönderim başarısız",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
