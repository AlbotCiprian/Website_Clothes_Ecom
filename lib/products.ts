import { Prisma, ProductStatus, ReviewStatus } from "@prisma/client";

import { prisma } from "./db";

export type SortOption = "featured" | "new" | "price-asc" | "price-desc";

export interface ProductListParams {
  sizes?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
  page?: number;
  take?: number;
}

export function parseProductListParams(searchParams: URLSearchParams): ProductListParams {
  const sizes = searchParams.getAll("size").flatMap((value) => value.split(",")).filter(Boolean);
  const colors = searchParams.getAll("color").flatMap((value) => value.split(",")).filter(Boolean);

  const sortParam = searchParams.get("sort");
  const pageParam = searchParams.get("page");
  const takeParam = searchParams.get("take");
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");

  const parseMoney = (value: string | null) => {
    if (!value) return undefined;
    const normalised = value.replace(",", ".").replace(/[^\d.]/g, "");
    const parsed = Number.parseFloat(normalised);
    if (!Number.isFinite(parsed)) return undefined;
    return Math.max(0, Math.round(parsed * 100));
  };

  const minPrice = parseMoney(minPriceParam);
  const maxPrice = parseMoney(maxPriceParam);

  const page = pageParam ? Number.parseInt(pageParam, 10) : undefined;
  const take = takeParam ? Number.parseInt(takeParam, 10) : undefined;

  const sort: SortOption | undefined =
    sortParam && ["featured", "new", "price-asc", "price-desc"].includes(sortParam)
      ? (sortParam as SortOption)
      : undefined;

  return {
    sizes: sizes.length ? sizes : undefined,
    colors: colors.length ? colors : undefined,
    sort,
    page: page && Number.isFinite(page) ? Math.max(1, page) : undefined,
    take: take && Number.isFinite(take) ? Math.max(1, take) : undefined,
    minPrice: minPrice ?? undefined,
    maxPrice: maxPrice ?? undefined,
  };
}

export interface ProductListItem {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  price: number;
  minVariantPrice: number;
  maxVariantPrice: number;
  averageRating: number | null;
  reviewCount: number;
  variants: Array<{
    id: string;
    name: string;
    size?: string | null;
    color?: string | null;
    price: number;
    stock: number;
  }>;
}

export interface ProductListResponse {
  items: ProductListItem[];
  pageInfo: {
    page: number;
    take: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  facets: {
    sizes: string[];
    colors: string[];
    priceRange: {
      min: number | null;
      max: number | null;
    };
  };
}

export async function getProductList(params: ProductListParams = {}): Promise<ProductListResponse> {
  const take = Math.max(1, params.take ?? 12);
  const page = Math.max(1, params.page ?? 1);
  const skip = (page - 1) * take;

  const where = buildProductWhere(params);
  const orderBy = buildOrderBy(params.sort);

  const [rawProducts, totalItems, sizeOptions, colorOptions, priceRange] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: take + 1, // fetch one extra to determine next page
      include: {
        variants: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            size: true,
            color: true,
          },
        },
        reviews: {
          where: { status: ReviewStatus.APPROVED },
          select: { rating: true },
        },
      },
    }),
    prisma.product.count({ where }),
    prisma.variant.findMany({
      distinct: ["size"],
      where: { size: { not: null } },
      orderBy: { size: "asc" },
      select: { size: true },
    }),
    prisma.variant.findMany({
      distinct: ["color"],
      where: { color: { not: null } },
      orderBy: { color: "asc" },
      select: { color: true },
    }),
    prisma.product.aggregate({
      _min: { price: true },
      _max: { price: true },
    }),
  ]);

  const hasNextPage = rawProducts.length > take;
  const items = rawProducts.slice(0, take).map(mapProductListItem);

  return {
    items,
    pageInfo: {
      page,
      take,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / take)),
      hasNextPage,
      hasPreviousPage: page > 1,
    },
    facets: {
      sizes: sizeOptions
        .map(({ size }) => size)
        .filter((size): size is string => Boolean(size)),
      colors: colorOptions
        .map(({ color }) => color)
        .filter((color): color is string => Boolean(color)),
      priceRange: {
        min: priceRange._min.price ?? null,
        max: priceRange._max.price ?? null,
      },
    },
  };
}

function buildProductWhere(params: ProductListParams): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [{ status: ProductStatus.PUBLISHED }];

  if (params.sizes?.length) {
    and.push({
      variants: {
        some: {
          size: { in: params.sizes },
        },
      },
    });
  }

  if (params.colors?.length) {
    and.push({
      variants: {
        some: {
          color: { in: params.colors },
        },
      },
    });
  }

  if (params.minPrice != null || params.maxPrice != null) {
    and.push({
      price: {
        gte: params.minPrice ?? undefined,
        lte: params.maxPrice ?? undefined,
      },
    });
  }

  return and.length > 1 ? { AND: and } : and[0];
}

function buildOrderBy(sort: SortOption | undefined): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "new":
      return [{ createdAt: "desc" }];
    case "price-asc":
      return [{ price: "asc" }];
    case "price-desc":
      return [{ price: "desc" }];
    case "featured":
    default:
      return [
        { updatedAt: "desc" },
        { createdAt: "desc" },
      ];
  }
}

function mapProductListItem(product: Prisma.ProductGetPayload<{
  include: {
    variants: {
      select: {
        id: true;
        name: true;
        price: true;
        stock: true;
        size: true;
        color: true;
      };
    };
    reviews: {
      where: {
        status: ReviewStatus.APPROVED;
      };
      select: {
        rating: true;
      };
    };
  };
}>): ProductListItem {
  const prices = product.variants.map((variant) => variant.price);
  const minVariantPrice = prices.length ? Math.min(...prices) : product.price;
  const maxVariantPrice = prices.length ? Math.max(...prices) : product.price;
  const reviewCount = product.reviews.length;
  const totalRating = product.reviews.reduce((acc, item) => acc + item.rating, 0);

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    thumbnailUrl: product.thumbnailUrl,
    price: product.price,
    minVariantPrice,
    maxVariantPrice,
    averageRating: reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : null,
    reviewCount,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      price: variant.price,
      stock: variant.stock,
      size: variant.size,
      color: variant.color,
    })),
  };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      variants: {
        orderBy: { price: "asc" },
      },
      reviews: {
        where: { status: ReviewStatus.APPROVED },
        orderBy: { createdAt: "desc" },
      },
      linkTrackers: true,
    },
  });
}

export async function createPendingReview(input: {
  productId: string;
  rating: number;
  title?: string;
  body: string;
  authorName: string;
  authorEmail?: string;
}) {
  return prisma.review.create({
    data: {
      rating: input.rating,
      title: input.title,
      body: input.body,
      status: ReviewStatus.PENDING,
      authorName: input.authorName,
      authorEmail: input.authorEmail,
      product: {
        connect: { id: input.productId },
      },
    },
  });
}
