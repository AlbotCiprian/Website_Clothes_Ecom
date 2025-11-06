import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createRateLimiter } from "@/lib/rate-limit";
import { createPendingReview } from "@/lib/products";
import { prisma } from "@/lib/db";

const reviewSchema = z.object({
  productId: z.string().min(1),
  name: z.string().trim().min(2),
  email: z.string().email().optional(),
  rating: z.number().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(20),
});

const listSchema = z.object({
  productId: z.string().min(1),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
});

const limiter = createRateLimiter({ limit: 60, windowMs: 60_000 });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = listSchema.safeParse({
      productId: searchParams.get("productId"),
      page: searchParams.get("page") ? Number.parseInt(searchParams.get("page")!, 10) : undefined,
      pageSize: searchParams.get("pageSize")
        ? Number.parseInt(searchParams.get("pageSize")!, 10)
        : undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    const skip = (parsed.data.page - 1) * parsed.data.pageSize;

    const [items, total] = await prisma.$transaction([
      prisma.review.findMany({
        where: {
          productId: parsed.data.productId,
          status: "APPROVED",
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parsed.data.pageSize,
      }),
      prisma.review.count({
        where: {
          productId: parsed.data.productId,
          status: "APPROVED",
        },
      }),
    ]);

    return NextResponse.json({
      items,
      total,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
      totalPages: Math.max(Math.ceil(total / parsed.data.pageSize), 1),
    });
  } catch (error) {
    console.error("[reviews][GET]", error);
    return NextResponse.json({ error: "Unable to load reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const headerList = headers();
    const ip =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerList.get("x-real-ip") ??
      "anonymous";

    if (!limiter.check(`reviews:${ip}`)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const payload = await request.json();
    const parsed = reviewSchema.safeParse({
      productId: payload.productId,
      name: payload.name,
      email: payload.email,
      rating: Number(payload.rating),
      title: payload.title,
      body: payload.body,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 422 },
      );
    }

    await createPendingReview({
      productId: parsed.data.productId,
      authorName: parsed.data.name,
      authorEmail: parsed.data.email,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
    });

    return NextResponse.json({ status: "ok" }, { status: 201 });
  } catch (error) {
    console.error("[reviews][POST]", error);
    return NextResponse.json(
      { error: "Unable to submit review right now." },
      { status: 500 },
    );
  }
}
