import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const customerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  address: z.string().trim().min(5),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  postal: z.string().trim().min(3),
  shipping: z.enum(["standard", "express"]),
});

const cartItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
});

const cartSchema = z.object({
  items: z.array(cartItemSchema).min(1),
});

const payloadSchema = z.object({
  customer: customerSchema,
  cart: cartSchema,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = payloadSchema.parse(body);

    const total = payload.cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const orderNumber = `D-${Date.now().toString(36).toUpperCase()}`;

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          status: "PENDING",
          total,
          currency: "USD",
          notes: JSON.stringify({
            customer: payload.customer,
            source: "demo-checkout",
          }),
        },
      });

      await tx.orderItem.createMany({
        data: payload.cart.items.map((item) => ({
          orderId: order.id,
          quantity: item.quantity,
          unitPrice: item.price,
          productId: item.productId,
          variantId: item.variantId,
        })),
      });
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[checkout.demo][POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 });
    }
    return NextResponse.json({ error: "Checkout unavailable" }, { status: 500 });
  }
}
