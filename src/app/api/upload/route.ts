import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const raw = formData.get("file");

    if (!raw || typeof raw === "string") {
      return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
    }

    // At this point, raw is a Blob (File extends Blob)
    // We use Blob interface only — no File reference needed
    const file: Blob = raw;

    const fileType = file.type || "image/png";

    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: "Sadece JPEG, PNG, WebP veya GIF yüklenebilir" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Dosya boyutu en fazla 2MB olabilir" },
        { status: 400 }
      );
    }

    // Convert to base64 data URL for persistent storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    const mimeMap: Record<string, string> = {
      "image/jpeg": "image/jpeg",
      "image/png": "image/png",
      "image/webp": "image/webp",
      "image/gif": "image/gif",
    };
    const mimeType = mimeMap[fileType] || "image/png";

    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({ url: dataUrl });
  } catch (err) {
    console.error("[UPLOAD ERROR]", err);
    const message = err instanceof Error ? err.message : "Yükleme başarısız";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
