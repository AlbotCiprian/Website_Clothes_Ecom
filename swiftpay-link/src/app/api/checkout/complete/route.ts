import { DeliveryMethod, OrderStatus, PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { clearCart, getCart, getOrCreateCart } from "@/lib/cart";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(6).max(30),
    note: z.string().max(500).optional(),
  }),
  delivery: z.object({
    address: z.string().min(3),
    city: z.string().min(2),
    zip: z.string().min(2).optional().or(z.literal("")),
    method: z.nativeEnum(DeliveryMethod),
  }),
  paymentMethod: z.nativeEnum(PaymentMethod),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = payloadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const cartRecord = await getOrCreateCart();
    const cart = await getCart(cartRecord.id);

    if (!cart.items.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // derive seller from first cart item variant
    const firstVariantId = cart.items[0]?.productVariantId;
    const variant = firstVariantId
      ? await prisma.productVariant.findUnique({
          where: { id: firstVariantId },
          include: { product: true },
        })
      : null;

    if (!variant) {
      return NextResponse.json({ error: "Unable to resolve seller" }, { status: 400 });
    }

    const subtotal = new Prisma.Decimal(cart.totals.subtotal.toFixed(2));
    const deliveryFee = new Prisma.Decimal(0);
    const totalAmount = subtotal.plus(deliveryFee);
    const now = new Date();

    const orderNumber = `SP-${Date.now().toString(36).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        sellerId: variant.product.sellerId,
        status: OrderStatus.PENDING_PAYMENT,
        customerName: parsed.data.customer.name,
        customerEmail: parsed.data.customer.email,
        customerPhone: parsed.data.customer.phone,
        customerNote: parsed.data.customer.note,
        deliveryMethod: parsed.data.delivery.method,
        deliveryAddress: parsed.data.delivery.address,
        deliveryCity: parsed.data.delivery.city,
        deliveryZip: parsed.data.delivery.zip || null,
        currency: "MDL",
        subtotal,
        deliveryFee,
        totalAmount,
        createdAt: now,
        items: {
          create: cart.items.map((item) => {
            const unitPrice = new Prisma.Decimal(item.unitPrice.toFixed(2));
            const lineTotal = unitPrice.mul(item.quantity);
            return {
              productVariantId: item.productVariantId,
              productName: item.productName,
              variantLabel: item.variantLabel,
              quantity: item.quantity,
              unitPrice,
              lineTotal,
            };
          }),
        },
        payment: {
          create: {
            status: PaymentStatus.PENDING,
            method: parsed.data.paymentMethod,
            amount: totalAmount,
            currency: "MDL",
            createdAt: now,
          },
        },
      },
      select: { id: true },
    });

    await clearCart(cartRecord.id);

    const redirectUrl = `/checkout/mock-payment?orderId=${order.id}`;
    return NextResponse.json({ redirect: redirectUrl });
  } catch (error) {
    console.error("checkout complete error", error);
    return NextResponse.json({ error: "Unable to complete checkout" }, { status: 500 });
  }
}
