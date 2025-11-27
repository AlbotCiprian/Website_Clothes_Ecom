import { Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const urlPattern = /^https?:\/\//i;

export const productPayloadSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().max(2000).optional().or(z.literal("")),
  basePrice: z.string().min(1, "Base price is required"),
  thumbnailUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => value === undefined || value === "" || isValidUrlOrPath(value),
      { message: "Invalid url" },
    ),
  variants: z
    .array(
      z.object({
        sku: z.string().min(1, "SKU is required"),
        price: z.string().min(1, "Price is required"),
        stock: z.coerce.number().int().min(0),
        color: z.string().optional().or(z.literal("")),
        size: z.string().optional().or(z.literal("")),
      }),
    )
    .min(1, "Add at least one variant"),
});

export type ProductPayload = z.infer<typeof productPayloadSchema>;

export function isValidUrlOrPath(value: string) {
  if (value.startsWith("/")) return true;
  if (urlPattern.test(value)) {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function normalizeThumbnailUrl(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export async function createAdminProduct(payload: ProductPayload) {
  const seller = await prisma.seller.findFirst();
  if (!seller) {
    throw new Error("No seller found. Seed the database first.");
  }

  const normalizedThumbnail = normalizeThumbnailUrl(payload.thumbnailUrl);

  try {
    const product = await prisma.product.create({
      data: {
        sellerId: seller.id,
        name: payload.name,
        description: payload.description || null,
        basePrice: payload.basePrice,
        imageUrl: normalizedThumbnail,
        variants: {
          create: payload.variants.map((variant) => ({
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
            color: variant.color || null,
            size: variant.size || null,
          })),
        },
      },
      include: { variants: true },
    });
    return product;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("SKU must be unique. One of the variants already exists.");
    }
    throw error;
  }
}
