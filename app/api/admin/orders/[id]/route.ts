import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";

const bodySchema = z.object({
  status: z.string().min(1),
});

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { status: parsed.data.status, updatedAt: new Date() },
      select: { id: true, status: true },
    });

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error("[admin.orders.update]", error);
    return NextResponse.json({ error: "Unable to update order" }, { status: 500 });
  }
}
