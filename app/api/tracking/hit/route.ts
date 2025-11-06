import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createRateLimiter } from "@/lib/rate-limit";
import { prisma } from "@/lib/db";
import { findLinkByCode } from "@/lib/links";

const payloadSchema = z.object({
  path: z.string().min(1),
  event: z.string().min(1),
  productId: z.string().optional(),
  linkId: z.string().optional(),
  ref: z.string().optional(),
  ua: z.string().optional(),
});

const limiter = createRateLimiter({ limit: 60, windowMs: 60_000 });

export async function POST(request: Request) {
  try {
    const headerList = headers();
    const ip =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerList.get("x-real-ip") ??
      "anonymous";

    if (!limiter.check(`tracking:${ip}`)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const payload = payloadSchema.parse(body);

    let linkId = payload.linkId ?? null;

    const refCode = payload.ref?.toUpperCase();

    if (!linkId && refCode) {
      const link = await findLinkByCode(refCode);
      linkId = link?.id ?? null;
    }

    await prisma.trackingEvent.create({
      data: {
        event: payload.event,
        path: payload.path,
        productId: payload.productId ?? null,
        linkId,
        ref: refCode ?? null,
        userAgent:
          payload.ua ??
          headerList.get("user-agent") ??
          null,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[tracking.hit][POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
    }
    return NextResponse.json({ error: "Unable to record event" }, { status: 500 });
  }
}
