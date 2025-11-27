import { cookies, type ReadonlyRequestCookies } from "next/headers";
import { randomUUID } from "crypto";

import { prisma } from "@/lib/prisma";

const CART_COOKIE = "cart_token";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type CartLine = {
  id: string;
  productVariantId: string;
  productName: string;
  variantLabel: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type CartPayload = {
  id: string;
  items: CartLine[];
  totals: {
    subtotal: number;
    itemCount: number;
  };
};

export async function getOrCreateCart(cookieStore: ReadonlyRequestCookies = cookies()) {
  const existingToken = cookieStore.get(CART_COOKIE)?.value;

  if (existingToken) {
    const existing = await prisma.cart.findUnique({ where: { cartToken: existingToken } });
    if (existing) {
      return existing;
    }
  }

  const cartToken = randomUUID();
  const cart = await prisma.cart.create({ data: { cartToken } });

  try {
    // Only available in Route Handlers / Server Actions. Guard to avoid crashes in RSCs.
    // @ts-expect-error - set exists in mutable cookie stores
    cookieStore.set({
      name: CART_COOKIE,
      value: cartToken,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: CART_COOKIE_MAX_AGE,
    });
  } catch {
    // ignore if cookies cannot be set in this context
  }

  return cart;
}

export async function clearCart(cartId: string) {
  await prisma.cartItem.deleteMany({ where: { cartId } });
}

export async function upsertCartItem(cartId: string, productVariantId: string, quantity: number) {
  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { cartId, productVariantId } });
    return;
  }

  await prisma.cartItem.upsert({
    where: {
      cartId_productVariantId: {
        cartId,
        productVariantId,
      },
    },
    update: { quantity },
    create: {
      cartId,
      productVariantId,
      quantity,
    },
  });
}

export async function getCart(cartId: string): Promise<CartPayload> {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          productVariant: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    return { id: "", items: [], totals: { subtotal: 0, itemCount: 0 } };
  }

  const items: CartLine[] = cart.items.map((item) => {
    const variant = item.productVariant;
    const product = variant.product;
    const price = Number((variant.price ?? product.basePrice).toString());
    const lineTotal = price * item.quantity;
    const variantLabel = [variant.color, variant.size].filter(Boolean).join(" / ") || "Standard";

    return {
      id: item.id,
      productVariantId: item.productVariantId,
      productName: product.name,
      variantLabel,
      imageUrl: product.imageUrl ?? null,
      quantity: item.quantity,
      unitPrice: price,
      lineTotal,
    };
  });

  const totals = items.reduce(
    (acc, item) => {
      acc.subtotal += item.lineTotal;
      acc.itemCount += item.quantity;
      return acc;
    },
    { subtotal: 0, itemCount: 0 },
  );

  return { id: cart.id, items, totals };
}
