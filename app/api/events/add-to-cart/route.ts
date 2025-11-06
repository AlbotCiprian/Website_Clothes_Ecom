import { NextResponse } from "next/server";

import { recordAddToCartEvent } from "@/lib/links";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const productId = typeof body.productId === "string" ? body.productId : null;
    const variantId = typeof body.variantId === "string" ? body.variantId : undefined;
    const trackerCode =
      typeof body.trackerCode === "string" && body.trackerCode.length > 0
        ? body.trackerCode
        : undefined;

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    await recordAddToCartEvent({
      productId,
      variantId,
      trackerCode,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[events.add-to-cart]", error);
    return NextResponse.json({ error: "Unable to track add to cart" }, { status: 500 });
  }
}
