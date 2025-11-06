import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { ZodError } from "zod";

import { requireAdminSession } from "@/lib/auth";
import {
  createAdminProduct,
  getAdminProductList,
  parseAdminProductPayload,
  type ProductSort,
} from "@/lib/admin/products";

export async function GET(request: Request) {
  await requireAdminSession();

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const sortParam = searchParams.get("sort");
  const pageValue = searchParams.get("page");
  const filters = {
    search: searchParams.get("q") ?? undefined,
    status:
      statusParam && ["PUBLISHED", "DRAFT", "ARCHIVED", "all"].includes(statusParam)
        ? (statusParam as "PUBLISHED" | "DRAFT" | "ARCHIVED" | "all")
        : undefined,
    sort:
      sortParam && ["recent", "title", "price-asc", "price-desc", "status"].includes(sortParam)
        ? (sortParam as ProductSort)
        : undefined,
    page:
      pageValue && !Number.isNaN(Number.parseInt(pageValue, 10))
        ? Math.max(1, Number.parseInt(pageValue, 10))
        : undefined,
  };

  const data = await getAdminProductList(filters);

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  await requireAdminSession();

  try {
    const payload = await request.json();
    const input = parseAdminProductPayload(payload);
    const product = await createAdminProduct(input);
    revalidateTag("products");

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("[api.products.POST]", error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
    }
    return NextResponse.json({ error: "Unable to create product" }, { status: 500 });
  }
}
