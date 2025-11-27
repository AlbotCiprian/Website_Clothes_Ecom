import { notFound } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";

import ProductForm from "@/components/admin/ProductForm";
import { requireAdminSession } from "@/lib/auth";
import {
  getAdminProduct,
  parseAdminProductPayload,
  updateAdminProduct,
} from "@/lib/admin/products";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditProductPage({ params }: EditProductPageProps) {
  await requireAdminSession();

  const { id } = await params;
  const product = await getAdminProduct(id);
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

    const input = parseAdminProductPayload(JSON.parse(payload));
    await updateAdminProduct(id, input);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}/edit`);
    revalidateTag("products");
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
