import { LinkTarget, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export interface LinkFilters {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminLinkListItem {
  id: string;
  code: string;
  label: string;
  medium?: string | null;
  target: LinkTarget;
  url: string;
  createdAt: Date;
  productTitle: string;
  productSlug: string;
  variantName?: string | null;
  hits: number;
}

export interface AdminLinkListResponse {
  items: AdminLinkListItem[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateLinkInput {
  productId: string;
  variantId?: string;
  label: string;
  medium?: string;
  target: LinkTarget;
  redirectTo?: string | null;
}

export async function getAdminLinks(filters: LinkFilters = {}): Promise<AdminLinkListResponse> {
  const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100);
  const page = Math.max(filters.page ?? 1, 1);
  const skip = (page - 1) * pageSize;

  const where: Prisma.LinkTrackerWhereInput = {};

  if (filters.search) {
    where.OR = [
      { code: { contains: filters.search, mode: "insensitive" } },
      { label: { contains: filters.search, mode: "insensitive" } },
      { medium: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [links, totalItems] = await prisma.$transaction([
    prisma.linkTracker.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        product: {
          select: {
            title: true,
            slug: true,
          },
        },
        variant: {
          select: { name: true },
        },
        _count: { select: { hits: true } },
      },
    }),
    prisma.linkTracker.count({ where }),
  ]);

  return {
    items: links.map((link) => ({
      id: link.id,
      code: link.code,
      label: link.label,
      medium: link.medium,
      target: link.target,
      url: link.url,
      createdAt: link.createdAt,
      productTitle: link.product.title,
      productSlug: link.product.slug,
      variantName: link.variant?.name,
      hits: link._count.hits,
    })),
    totalItems,
    page,
    pageSize,
    totalPages: Math.max(Math.ceil(totalItems / pageSize), 1),
  };
}

export async function createAdminLink(input: CreateLinkInput) {
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    select: { slug: true },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  let variantSlug: string | undefined;

  if (input.variantId) {
    const variant = await prisma.variant.findUnique({
      where: { id: input.variantId },
      select: { id: true },
    });

    if (!variant) {
      throw new Error("Variant not found");
    }
    variantSlug = variant.id;
  }

  const code = await generateUniqueCode();
  const url = buildLinkUrl({
    code,
    productId: input.productId,
    productSlug: product.slug,
    variantId: variantSlug,
    target: input.target,
    redirect: input.redirectTo ?? undefined,
  });

  return prisma.linkTracker.create({
    data: {
      productId: input.productId,
      variantId: input.variantId,
      label: input.label,
      medium: input.medium,
      target: input.target,
      redirectTo: input.redirectTo ?? null,
      code,
      url,
    },
  });
}

async function generateUniqueCode(length = 6): Promise<string> {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  while (true) {
    let code = "";
    for (let index = 0; index < length; index += 1) {
      const randomIndex = Math.floor(Math.random() * alphabet.length);
      code += alphabet[randomIndex];
    }

    const existing = await prisma.linkTracker.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!existing) {
      return code;
    }
  }
}

function buildLinkUrl({
  code,
  productId,
  productSlug,
  variantId,
  target,
  redirect,
}: {
  code: string;
  productId: string;
  productSlug: string;
  variantId?: string;
  target: LinkTarget;
  redirect?: string;
}) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (target === LinkTarget.ADD_TO_CART) {
    const params = new URLSearchParams({
      add: productId,
      ref: code,
    });

    if (variantId) {
      params.set("variant", variantId);
    }

    if (redirect) {
      params.set("redirect", redirect);
    }

    return `${base}/shop?${params.toString()}`;
  }

  const params = new URLSearchParams({
    ref: code,
  });

  if (redirect) {
    params.set("redirect", redirect);
  }

  return `${base}/product/${productSlug}?${params.toString()}`;
}
