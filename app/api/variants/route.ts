import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";

import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1),
  price: z.union([z.number(), z.string()]),
  stock: z.union([z.number(), z.string()]).default(0),
  size: z.string().optional(),
  color: z.string().optional(),
  sku: z.string().optional(),
  imageUrl: z.string().url().optional(),
  deleted: z.boolean().optional(),
});

const payloadSchema = z.object({
  productId: z.string().min(1),
  variants: z.array(variantSchema).min(1),
});

export async function POST(request: Request) {
  await requireAdminSession();

  try {
    const body = await request.json();
    const payload = payloadSchema.parse(body);

    await prisma.$transaction(async (tx) => {
      for (const variant of payload.variants) {
        const price = normalisePrice(variant.price);
        const stock =
          typeof variant.stock === "number"
            ? variant.stock
            : Number.parseInt(variant.stock, 10) || 0;

        const existing =
          variant.id != null
            ? await tx.variant.findUnique({
                where: { id: variant.id },
                select: { productId: true },
              })
            : null;

        if (variant.id && (!existing || existing.productId !== payload.productId)) {
          throw new Error("Variant not found");
        }

        if (variant.deleted && variant.id) {
          await tx.variant.delete({
            where: { id: variant.id },
          });
          continue;
        }

        if (variant.id) {
          await tx.variant.update({
            where: { id: variant.id },
            data: {
              name: variant.name,
              price,
              stock,
              size: variant.size?.trim() || null,
              color: variant.color?.trim() || null,
              sku: variant.sku?.trim() || null,
              imageUrl: variant.imageUrl ?? null,
            },
          });
        } else {
          await tx.variant.create({
            data: {
              productId: payload.productId,
              name: variant.name,
              price,
              stock,
              size: variant.size?.trim() || null,
              color: variant.color?.trim() || null,
              sku: variant.sku?.trim() || null,
              imageUrl: variant.imageUrl ?? null,
            },
          });
        }
      }
    });

    revalidateTag("products");

    const variants = await prisma.variant.findMany({
      where: { productId: payload.productId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ variants });
  } catch (error) {
    console.error("[api.variants.POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 422 });
    }
    return NextResponse.json({ error: "Unable to update variants" }, { status: 500 });
  }
}

function normalisePrice(value: number | string) {
  if (typeof value === "number") {
    return Math.round(value * 100);
  }
  const normalised = value.replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(normalised);
  if (Number.isNaN(parsed)) {
    return 0;
  }
  return Math.round(parsed * 100);
}
