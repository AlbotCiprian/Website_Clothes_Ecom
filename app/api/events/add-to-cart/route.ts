import { NextResponse } from "next/server";

import { recordAddToCartEvent } from "@/lib/links";
import { prisma } from "@/lib/db";

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

    // ensure product exists to avoid FK errors
    const productExists = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!productExists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
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
