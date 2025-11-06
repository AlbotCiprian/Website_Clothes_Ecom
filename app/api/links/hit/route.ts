import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { recordLinkHit } from "@/lib/links";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = typeof body.code === "string" ? body.code.trim() : "";

    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    const headerStore = headers();
    const ipAddress = headerStore.get("x-forwarded-for") ?? headerStore.get("x-client-ip");
    const userAgent = headerStore.get("user-agent");
    const referer = headerStore.get("referer");

    const tracker = await recordLinkHit({
      code,
      ipAddress,
      userAgent,
      referer,
    });

    if (!tracker) {
      return NextResponse.json({ error: "Code not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[links.hit]", error);
    return NextResponse.json({ error: "Unable to record hit" }, { status: 500 });
  }
}
