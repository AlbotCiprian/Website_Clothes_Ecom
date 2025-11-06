import { NextResponse } from "next/server";
import { z } from "zod";

import { createPendingReview } from "@/lib/products";

const reviewSchema = z.object({
  productId: z.string().min(1),
  name: z.string().trim().min(2),
  email: z.string().email().optional(),
  rating: z.number().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(20),
});

export async function POST(request: Request) {
  try {
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
