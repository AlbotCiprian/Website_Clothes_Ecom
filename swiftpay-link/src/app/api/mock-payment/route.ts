import { OrderStatus, PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  orderId: z.string().min(1),
  outcome: z.enum(["success", "failure"]),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = payloadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: parsed.data.orderId },
      include: { payment: true },
    });

    if (!order || !order.payment) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const success = parsed.data.outcome === "success";

    await prisma.$transaction([
      prisma.payment.update({
        where: { orderId: order.id },
        data: { status: success ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { status: success ? OrderStatus.PAID : OrderStatus.FAILED },
      }),
    ]);

    return NextResponse.json({ redirect: success ? "/success" : "/fail" });
  } catch (error) {
    console.error("mock payment error", error);
    return NextResponse.json({ error: "Unable to simulate payment" }, { status: 500 });
  }
}
