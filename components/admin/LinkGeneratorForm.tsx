"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type LinkGeneratorProduct = {
  id: string;
  title: string;
  slug: string;
  variants: Array<{ id: string; name: string }>;
};

type LinkGeneratorFormProps = {
  products: LinkGeneratorProduct[];
  action: (formData: FormData) => void;
};

export default function LinkGeneratorForm({ products, action }: LinkGeneratorFormProps) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [target, setTarget] = useState<"PDP" | "ADD_TO_CART">("PDP");

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId),
    [productId, products],
  );

  return (
    <form
      action={action}
      className="mt-8 grid gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:grid-cols-2"
    >
      <Field label="Label" required>
        <input
          type="text"
          name="label"
          required
          placeholder="Instagram launch CTA"
          className={inputClass}
        />
      </Field>

      <Field label="Medium">
        <input
          type="text"
          name="medium"
          placeholder="social / email / affiliate"
          className={inputClass}
        />
      </Field>

      <Field label="Product" required>
        <select
          name="productId"
          value={productId}
          onChange={(event) => setProductId(event.target.value)}
          className={inputClass}
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.title}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Variant">
        <select
          name="variantId"
          className={inputClass}
          disabled={target === "PDP" || !selectedProduct || selectedProduct.variants.length === 0}
        >
          <option value="">Auto</option>
          {selectedProduct?.variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Target" required>
        <select
          name="target"
          value={target}
          onChange={(event) => setTarget(event.target.value as "PDP" | "ADD_TO_CART")}
          className={inputClass}
        >
          <option value="PDP">Product detail page</option>
          <option value="ADD_TO_CART">Instant add to cart</option>
        </select>
      </Field>

      <Field label="Redirect after landing">
        <select name="redirect" defaultValue="none" className={inputClass}>
          <option value="none">Stay on destination</option>
          <option value="/checkout">Go to checkout</option>
          <option value="pdp">Back to product page</option>
        </select>
      </Field>

      <div className="sm:col-span-2 flex justify-end">
        <Button type="submit">Generate link</Button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-neutral-700">
      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

const inputClass = cn(
  "rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10",
);
