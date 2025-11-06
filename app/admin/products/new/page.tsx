import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import ProductForm from "@/components/admin/ProductForm";
import { requireAdminSession } from "@/lib/auth";
import { createAdminProduct, type AdminProductInput } from "@/lib/admin/products";

export const metadata: Metadata = {
  title: "Claroche Admin · New product",
};

export default async function AdminNewProductPage() {
  await requireAdminSession();

  async function createProductAction(formData: FormData) {
    "use server";
    await requireAdminSession();

    const rawPayload = formData.get("payload")?.toString();
    if (!rawPayload) {
      throw new Error("Missing payload");
    }

    const input = parsePayload(rawPayload);
    const product = await createAdminProduct(input);
    revalidatePath("/admin/products");
    redirect(`/admin/products/${product.id}/edit`);
  }

  return (
    <section className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Create product</h1>
          <p className="text-sm text-neutral-600">
            Define product attributes and variants. Prices are stored in cents.
          </p>
        </div>
      </header>
      <ProductForm action={createProductAction} submitLabel="Create product" />
    </section>
  );
}

function parsePayload(raw: string): AdminProductInput {
  const data = JSON.parse(raw) as {
    title: string;
    slug: string;
    price: string;
    currency?: string;
    status: string;
    description?: string;
    thumbnailUrl?: string;
    variants: Array<{
      id?: string;
      name: string;
      price: string;
      stock: string;
      size?: string;
      color?: string;
      sku?: string;
      imageUrl?: string;
      deleted?: boolean;
    }>;
  };

  const price = parsePrice(data.price);
  const currency = data.currency?.toUpperCase() ?? "USD";

  return {
    title: data.title,
    slug: data.slug,
    description: data.description ?? null,
    price,
    currency,
    thumbnailUrl: data.thumbnailUrl ?? null,
    status: toStatus(data.status),
    variants: data.variants.map((variant) => {
      const stock = Number.parseInt(variant.stock || "0", 10);
      return {
        id: variant.id,
        name: variant.name,
        price: parsePrice(variant.price),
        stock: Number.isNaN(stock) ? 0 : stock,
        size: variant.size || null,
        color: variant.color || null,
        sku: variant.sku || null,
        imageUrl: variant.imageUrl || null,
        deleted: Boolean(variant.deleted),
      };
    }),
  };
}

function parsePrice(value: string) {
  const normalised = value.replace(/[^0-9.]/g, "");
  const number = Number.parseFloat(normalised);
  if (Number.isNaN(number)) {
    return 0;
  }
  return Math.round(number * 100);
}

function toStatus(value: string) {
  switch (value) {
    case "DRAFT":
      return "DRAFT";
    case "ARCHIVED":
      return "ARCHIVED";
    default:
      return "PUBLISHED";
  }
}
