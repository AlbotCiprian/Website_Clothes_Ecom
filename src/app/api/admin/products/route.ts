import { NextResponse } from "next/server";

import { createAdminProduct, productPayloadSchema } from "@/lib/admin/products";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = productPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const product = await createAdminProduct(parsed.data);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    const message = (error as Error).message ?? "Unexpected error";
    const status = message.toLowerCase().includes("sku must be unique") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
