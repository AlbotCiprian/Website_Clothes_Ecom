import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";

import ProductForm from "@/components/admin/ProductForm";
import { requireAdminSession } from "@/lib/auth";
import { createAdminProduct, parseAdminProductPayload } from "@/lib/admin/products";

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

    const input = parseAdminProductPayload(JSON.parse(rawPayload));
    const product = await createAdminProduct(input);
    revalidatePath("/admin/products");
    revalidateTag("products");
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
