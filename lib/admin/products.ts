import { Prisma, ProductStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

export type ProductSort =
  | "recent"
  | "title"
  | "price-asc"
  | "price-desc"
  | "status";

export interface ProductListFilters {
  search?: string;
  status?: ProductStatus | "all";
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

export interface AdminProductListItem {
  id: string;
  title: string;
  slug: string;
  status: ProductStatus;
  price: number;
  updatedAt: Date;
  variantsCount: number;
  reviewsCount: number;
}

export interface AdminProductListResponse {
  items: AdminProductListItem[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAdminProductList(
  filters: ProductListFilters = {},
): Promise<AdminProductListResponse> {
  const pageSize = Math.min(Math.max(filters.pageSize ?? 10, 1), 50);
  const page = Math.max(filters.page ?? 1, 1);
  const skip = (page - 1) * pageSize;
  const sort = filters.sort ?? "recent";

  const where: Prisma.ProductWhereInput = {};

  if (filters.status && filters.status !== "all") {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { slug: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const orderBy = productOrderBy(sort);

  const [products, totalItems] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        _count: {
          select: {
            variants: true,
            reviews: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: products.map((product) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      status: product.status,
      price: product.price,
      updatedAt: product.updatedAt,
      variantsCount: product._count.variants,
      reviewsCount: product._count.reviews,
    })),
    totalItems,
    page,
    pageSize,
    totalPages: Math.max(Math.ceil(totalItems / pageSize), 1),
  };
}

function productOrderBy(sort: ProductSort): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "title":
      return [{ title: "asc" }];
    case "price-asc":
      return [{ price: "asc" }];
    case "price-desc":
      return [{ price: "desc" }];
    case "status":
      return [{ status: "asc" }, { updatedAt: "desc" }];
    case "recent":
    default:
      return [{ updatedAt: "desc" }];
  }
}

export async function getAdminProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      variants: {
        orderBy: { createdAt: "asc" },
      },
      linkTrackers: true,
    },
  });
}

export type AdminVariantInput = {
  id?: string;
  name: string;
  price: number;
  stock: number;
  size?: string | null;
  color?: string | null;
  imageUrl?: string | null;
  sku?: string | null;
  deleted?: boolean;
};

export type AdminProductInput = {
  title: string;
  slug: string;
  description?: string | null;
  price: number;
  currency?: string | null;
  thumbnailUrl?: string | null;
  status: ProductStatus;
  variants: AdminVariantInput[];
};

export async function createAdminProduct(input: AdminProductInput) {
  return prisma.product.create({
    data: {
      title: input.title,
      slug: input.slug,
      description: input.description,
      price: input.price,
      currency: input.currency ?? "USD",
      thumbnailUrl: input.thumbnailUrl,
      status: input.status,
      variants: {
        create: input.variants
          .filter((variant) => !variant.deleted)
          .map((variant) => ({
            name: variant.name,
            price: variant.price,
            stock: variant.stock,
            size: variant.size,
            color: variant.color,
            imageUrl: variant.imageUrl,
            sku: variant.sku,
          })),
      },
    },
  });
}

export async function updateAdminProduct(id: string, input: AdminProductInput) {
  const createVariants = input.variants.filter((variant) => !variant.id && !variant.deleted);
  const updateVariants = input.variants.filter((variant) => variant.id && !variant.deleted);
  const deleteVariantIds = input.variants
    .filter((variant) => variant.id && variant.deleted)
    .map((variant) => variant.id as string);

  return prisma.product.update({
    where: { id },
    data: {
      title: input.title,
      slug: input.slug,
      description: input.description,
      price: input.price,
      currency: input.currency ?? "USD",
      thumbnailUrl: input.thumbnailUrl,
      status: input.status,
      variants: {
        create: createVariants.map((variant) => ({
          name: variant.name,
          price: variant.price,
          stock: variant.stock,
          size: variant.size,
          color: variant.color,
          imageUrl: variant.imageUrl,
          sku: variant.sku,
        })),
        update: updateVariants.map((variant) => ({
          where: { id: variant.id! },
          data: {
            name: variant.name,
            price: variant.price,
            stock: variant.stock,
            size: variant.size,
            color: variant.color,
            imageUrl: variant.imageUrl,
            sku: variant.sku,
          },
        })),
        deleteMany: deleteVariantIds.length ? { id: { in: deleteVariantIds } } : undefined,
      },
    },
  });
}

export async function deleteAdminProduct(id: string) {
  await prisma.product.delete({ where: { id } });
}
