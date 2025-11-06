import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

import ProductForm from "@/components/admin/ProductForm";
import { requireAdminSession } from "@/lib/auth";
import {
  getAdminProduct,
  updateAdminProduct,
  type AdminProductInput,
} from "@/lib/admin/products";

type EditProductPageProps = {
  params: { id: string };
};

export default async function AdminEditProductPage({ params }: EditProductPageProps) {
  await requireAdminSession();

  const product = await getAdminProduct(params.id);
  if (!product) {
    notFound();
  }

  async function updateProductAction(formData: FormData) {
    "use server";
    await requireAdminSession();

    const payload = formData.get("payload")?.toString();
    if (!payload) {
      throw new Error("Missing payload");
    }

    const input = parsePayload(payload);
    await updateAdminProduct(params.id, input);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${params.id}/edit`);
  }

  const initialState = {
    title: product.title,
    slug: product.slug,
    price: (product.price / 100).toFixed(2),
    currency: product.currency ?? "USD",
    status: product.status,
    description: product.description ?? "",
    thumbnailUrl: product.thumbnailUrl ?? "",
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      price: (variant.price / 100).toFixed(2),
      stock: String(variant.stock),
      size: variant.size ?? "",
      color: variant.color ?? "",
      sku: variant.sku ?? "",
      imageUrl: variant.imageUrl ?? "",
      deleted: false,
    })),
  };

  return (
    <section className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Edit product</h1>
          <p className="text-sm text-neutral-600">{product.title}</p>
        </div>
      </header>
      <ProductForm
        initialProduct={initialState}
        action={updateProductAction}
        submitLabel="Save changes"
      />
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

  return {
    title: data.title,
    slug: data.slug,
    description: data.description ?? null,
    price: parsePrice(data.price),
    currency: data.currency?.toUpperCase() ?? "USD",
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
