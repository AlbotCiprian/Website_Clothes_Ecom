import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

type ReviewStatusValue = "PENDING" | "APPROVED" | "REJECTED";

export interface ReviewFilters {
  status?: ReviewStatusValue | "all";
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminReviewListItem {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  status: ReviewStatusValue;
  authorName: string;
  authorEmail?: string | null;
  productTitle: string;
  productSlug: string;
  createdAt: Date;
}

export interface AdminReviewListResponse {
  items: AdminReviewListItem[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAdminReviews(filters: ReviewFilters = {}): Promise<AdminReviewListResponse> {
  const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100);
  const page = Math.max(filters.page ?? 1, 1);
  const skip = (page - 1) * pageSize;

  const where: Prisma.ReviewWhereInput = {};

  if (filters.status && filters.status !== "all") {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { body: { contains: filters.search, mode: "insensitive" } },
      { authorName: { contains: filters.search, mode: "insensitive" } },
      { authorEmail: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [reviews, totalItems] = await prisma.$transaction([
    prisma.review.findMany({
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
      },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    items: reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      body: review.body,
      status: review.status,
      authorName: review.authorName,
      authorEmail: review.authorEmail,
      productTitle: review.product.title,
      productSlug: review.product.slug,
      createdAt: review.createdAt,
    })),
    totalItems,
    page,
    pageSize,
    totalPages: Math.max(Math.ceil(totalItems / pageSize), 1),
  };
}

export async function approveReview(id: string) {
  return prisma.review.update({
    where: { id },
    data: { status: "APPROVED" },
  });
}

export async function rejectReview(id: string) {
  return prisma.review.update({
    where: { id },
    data: { status: "REJECTED" },
  });
}
