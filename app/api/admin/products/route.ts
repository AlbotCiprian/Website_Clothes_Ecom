import { NextResponse } from "next/server";

import { createAdminProduct, parseAdminProductPayload } from "@/lib/admin/products";
import { requireAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = await request.json();
    const rawPayload = body?.payload;
    if (!rawPayload) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }
    const parsedPayload = typeof rawPayload === "string" ? JSON.parse(rawPayload) : rawPayload;
    const input = parseAdminProductPayload(parsedPayload);
    const product = await createAdminProduct(input);
    return NextResponse.json({ id: product.id }, { status: 201 });
  } catch (error) {
    console.error("[admin/products][POST]", error);
    return NextResponse.json({ error: "Unable to create product" }, { status: 500 });
  }
}
