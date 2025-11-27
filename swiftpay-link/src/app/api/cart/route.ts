import { NextResponse } from "next/server";

import { clearCart, getCart, getOrCreateCart } from "@/lib/cart";

export async function GET() {
  const cart = await getOrCreateCart();
  const payload = await getCart(cart.id);
  return NextResponse.json({ cart: payload });
}

export async function DELETE() {
  const cart = await getOrCreateCart();
  await clearCart(cart.id);
  return NextResponse.json({ ok: true });
}
