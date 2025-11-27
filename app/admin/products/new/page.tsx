import type { Metadata } from "next";

import ProductForm from "@/components/admin/ProductForm";
import { requireAdminSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Claroche Admin � New product",
};

export default async function AdminNewProductPage() {
  await requireAdminSession();

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
      <ProductForm submitLabel="Create product" />
    </section>
  );
}
