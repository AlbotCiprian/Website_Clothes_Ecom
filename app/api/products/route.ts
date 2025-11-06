import { NextRequest, NextResponse } from "next/server";

import { getProductList, parseProductListParams } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const params = parseProductListParams(request.nextUrl.searchParams);
    const data = await getProductList(params);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[products][GET]", error);
    return NextResponse.json({ error: "Unable to load products" }, { status: 500 });
  }
}
