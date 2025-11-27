import { NextResponse } from "next/server";

import { clearCart, getOrCreateCart } from "@/lib/cart";
import { prisma } from "@/lib/prisma";

type Params = {
  params: { code: string };
};

export async function GET(_request: Request, { params }: Params) {
  const code = params.code.toUpperCase();
  const now = new Date();

  const link = await prisma.link.findUnique({
    where: { code },
    include: { items: true },
  });

  if (!link || !link.active || (link.expiresAt && link.expiresAt < now)) {
    return NextResponse.redirect(new URL("/link-not-found", process.env.APP_URL ?? "http://localhost:3000"));
  }

  const cart = await getOrCreateCart();

  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
    prisma.cartItem.createMany({
      data: link.items.map((item) => ({
        cartId: cart.id,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
      })),
    }),
    prisma.eventLog.create({
      data: {
        type: "link_hit",
        linkId: link.id,
        payload: {
          linkId: link.id,
          code,
          cartId: cart.id,
        },
      },
    }),
  ]);

  return NextResponse.redirect(new URL("/checkout", process.env.APP_URL ?? "http://localhost:3000"));
}
