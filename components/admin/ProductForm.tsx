"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type VariantState = {
  id?: string;
  name: string;
  price: string;
  stock: string;
  size?: string;
  color?: string;
  sku?: string;
  imageUrl?: string;
  deleted?: boolean;
};

type ProductState = {
  title: string;
  slug: string;
  price: string;
  currency: string;
  status: ProductStatusValue;
  description?: string;
  thumbnailUrl?: string;
  variants: VariantState[];
};

type ProductFormProps = {
  submitLabel: string;
  initialProduct?: ProductState;
};

const defaultVariant: VariantState = {
  name: "",
  price: "0.00",
  stock: "0",
  size: "",
  color: "",
  sku: "",
  imageUrl: "",
};

export default function ProductForm({ submitLabel, initialProduct }: ProductFormProps) {
  const router = useRouter();
  const [state, setState] = useState<ProductState>(
    initialProduct ?? {
      title: "",
      slug: "",
      price: "0.00",
      currency: "USD",
      status: "PUBLISHED",
      description: "",
      thumbnailUrl: "",
      variants: [{ ...defaultVariant }],
    },
  );
  const [isSubmitting, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(() => JSON.stringify(state), [state]);

  const handleVariantChange = (index: number, key: keyof VariantState, value: string) => {
    setState((prev) => {
      const variants = [...prev.variants];
      variants[index] = { ...variants[index], [key]: value };
      return { ...prev, variants };
    });
  };

  const handleVariantToggle = (index: number) => {
    setState((prev) => {
      const variants = [...prev.variants];
      const variant = variants[index];
      if (variant.id) {
        variants[index] = { ...variant, deleted: !variant.deleted };
      } else {
        variants.splice(index, 1);
      }
      return {
        ...prev,
        variants: variants.length > 0 ? variants : [{ ...defaultVariant }],
      };
    });
  };

  const addVariant = () => {
    setState((prev) => ({
      ...prev,
      variants: [...prev.variants, { ...defaultVariant }],
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          setError(data?.error ?? "Unable to create product");
          return;
        }
        const data = await response.json();
        router.push(`/admin/products/${data.id}/edit`);
      } catch (err) {
        console.error(err);
        setError("Unable to create product");
      }
    });
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <input type="hidden" name="payload" value={payload} />
      <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">Product details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" required>
            <input
              type="text"
              value={state.title}
              onChange={(event) => setState((prev) => ({ ...prev, title: event.target.value }))}
              className={inputClass}
            />
          </Field>
          <Field label="Slug" required>
            <input
              type="text"
              value={state.slug}
              onChange={(event) => setState((prev) => ({ ...prev, slug: event.target.value }))}
              className={inputClass}
            />
          </Field>
          <Field label="Thumbnail URL">
            <input
              type="url"
              value={state.thumbnailUrl ?? ""}
              onChange={(event) =>
                setState((prev) => ({ ...prev, thumbnailUrl: event.target.value }))
              }
              className={inputClass}
            />
          </Field>
          <Field label="Status">
            <select
              value={state.status}
              onChange={(event) =>
                setState((prev) => ({
                  ...prev,
                  status: event.target.value as ProductStatusValue,
                }))
              }
              className={inputClass}
            >
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </Field>
        </div>
        <Field label="Description">
          <textarea
            value={state.description ?? ""}
            onChange={(event) =>
              setState((prev) => ({ ...prev, description: event.target.value }))
            }
            rows={4}
            className={inputClass}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Base price (display)" required>
            <input
              type="text"
              value={state.price}
              onChange={(event) =>
                setState((prev) => ({ ...prev, price: event.target.value }))
              }
              className={inputClass}
            />
          </Field>
          <Field label="Currency">
            <input
              type="text"
              value={state.currency}
              onChange={(event) =>
                setState((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))
              }
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Variants</h2>
            <p className="text-xs text-neutral-500">
              Mark a variant as deleted to remove it after saving.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>
            Add variant
          </Button>
        </div>
        <div className="space-y-4">
          {state.variants.map((variant, index) => (
            <div
              key={variant.id ?? index}
              className={cn(
                "rounded-xl border border-neutral-200 p-4",
                variant.deleted ? "bg-red-50 border-red-200" : "bg-neutral-50",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-neutral-900">
                  Variant {index + 1} {variant.deleted ? "(will be removed)" : ""}
                </h3>
                <button
                  type="button"
                  onClick={() => handleVariantToggle(index)}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  {variant.deleted ? "Undo remove" : variant.id ? "Remove" : "Delete"}
                </button>
              </div>
              {!variant.deleted ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <VariantField
                    label="Name"
                    value={variant.name}
                    onChange={(value) => handleVariantChange(index, "name", value)}
                  />
                  <VariantField
                    label="Price"
                    value={variant.price}
                    onChange={(value) => handleVariantChange(index, "price", value)}
                  />
                  <VariantField
                    label="Stock"
                    value={variant.stock}
                    onChange={(value) => handleVariantChange(index, "stock", value)}
                  />
                  <VariantField
                    label="Size"
                    value={variant.size ?? ""}
                    onChange={(value) => handleVariantChange(index, "size", value)}
                  />
                  <VariantField
                    label="Color"
                    value={variant.color ?? ""}
                    onChange={(value) => handleVariantChange(index, "color", value)}
                  />
                  <VariantField
                    label="SKU"
                    value={variant.sku ?? ""}
                    onChange={(value) => handleVariantChange(index, "sku", value)}
                  />
                  <VariantField
                    label="Image URL"
                    value={variant.imageUrl ?? ""}
                    onChange={(value) => handleVariantChange(index, "imageUrl", value)}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
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

function VariantField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-neutral-600">
      <span className="font-semibold uppercase tracking-wide text-neutral-500">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}

const inputClass =
  "rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

type ProductStatusValue = "PUBLISHED" | "DRAFT" | "ARCHIVED";
