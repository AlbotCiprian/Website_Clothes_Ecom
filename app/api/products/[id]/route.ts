import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { ZodError } from "zod";

import { requireAdminSession } from "@/lib/auth";
import {
  deleteAdminProduct,
  getAdminProduct,
  parseAdminProductPayload,
  updateAdminProduct,
} from "@/lib/admin/products";

type RouteParams = {
  params: { id: string };
};

export async function GET(_: Request, { params }: RouteParams) {
  await requireAdminSession();
  const product = await getAdminProduct(params.id);

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(request: Request, { params }: RouteParams) {
  await requireAdminSession();

  try {
    const payload = await request.json();
    const input = parseAdminProductPayload(payload);
    const product = await updateAdminProduct(params.id, input);
    revalidateTag("products");
    return NextResponse.json(product);
  } catch (error) {
    console.error("[api.products.PUT]", error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
    }
    return NextResponse.json({ error: "Unable to update product" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  await requireAdminSession();
  try {
    await deleteAdminProduct(params.id);
    revalidateTag("products");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api.products.DELETE]", error);
    return NextResponse.json({ error: "Unable to delete product" }, { status: 500 });
  }
}
