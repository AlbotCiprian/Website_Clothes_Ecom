import { NextResponse } from "next/server";
import { z } from "zod";

import { getCart, getOrCreateCart, upsertCartItem } from "@/lib/cart";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  productVariantId: z.string().min(1),
  quantity: z.number().int().min(0).max(99),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { productVariantId, quantity } = parsed.data;
    const variant = await prisma.productVariant.findUnique({
      where: { id: productVariantId },
      include: { product: true },
    });

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const cart = await getOrCreateCart();
    await upsertCartItem(cart.id, productVariantId, quantity);
    const payload = await getCart(cart.id);

    return NextResponse.json({ cart: payload });
  } catch (error) {
    console.error("POST /api/cart/items error", error);
    return NextResponse.json({ error: "Unable to update cart" }, { status: 500 });
  }
}
