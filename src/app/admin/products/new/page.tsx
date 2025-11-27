"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { productPayloadSchema } from "@/lib/admin/products";

type VariantInput = {
  sku: string;
  price: string;
  stock: number;
  color?: string;
  size?: string;
};

export default function NewProductPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [variants, setVariants] = useState<Array<VariantInput>>([
    { sku: "", price: "", stock: 0, color: "", size: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addVariant = () => {
    setVariants((prev) => [...prev, { sku: "", price: "", stock: 0, color: "", size: "" }]);
  };

  const updateVariant = (index: number, key: keyof VariantInput, value: string) => {
    setVariants((prev) => prev.map((variant, i) => (i === index ? { ...variant, [key]: value } : variant)));
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    const payload = {
      name,
      description,
      basePrice,
      thumbnailUrl,
      variants: variants.map((variant) => ({
        ...variant,
        stock: Number(variant.stock),
      })),
    };

    const parsed = productPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      setSubmitting(false);
      setError("Please check required fields and try again.");
      return;
    }

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Unable to save product.");
      return;
    }

    setMessage("Product created.");
    setName("");
    setDescription("");
    setBasePrice("");
    setThumbnailUrl("");
    setVariants([{ sku: "", price: "", stock: 0, color: "", size: "" }]);
  };

  return (
    <div className="container-shell py-10">
      <div className="mb-6 flex items-center gap-3">
        <Badge variant="muted">Admin</Badge>
        <h1 className="text-2xl font-semibold text-neutral-900">Create product</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-800">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Midnight Tailored Blazer" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-800">Thumbnail URL</label>
                <Input
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://... or /images/products/blazer.png"
                />
                <p className="text-xs text-neutral-500">
                  Optional. Use a full URL (https://...), a site-relative path like /images/..., or leave empty.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-800">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none ring-0 transition focus:border-neutral-400"
                placeholder="Short product story..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-800">
                Base price (display) <span className="text-red-500">*</span>
              </label>
              <Input value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="99.00" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">Variants</h2>
                <Button type="button" variant="secondary" size="sm" onClick={addVariant}>
                  Add variant
                </Button>
              </div>

              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index} className="rounded-2xl border border-neutral-200 p-4">
                    <div className="flex items-center justify-between pb-3">
                      <p className="text-sm font-semibold text-neutral-800">Variant {index + 1}</p>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          className="text-xs font-semibold text-red-500 hover:text-red-600"
                          onClick={() => removeVariant(index)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-800">
                          SKU <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={variant.sku}
                          onChange={(e) => updateVariant(index, "sku", e.target.value)}
                          placeholder="SKU-001"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-800">
                          Price <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={variant.price}
                          onChange={(e) => updateVariant(index, "price", e.target.value)}
                          placeholder="99.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-800">Stock</label>
                        <Input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, "stock", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 md:col-span-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-neutral-800">Color</label>
                          <Input
                            value={variant.color}
                            onChange={(e) => updateVariant(index, "color", e.target.value)}
                            placeholder="Black"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-neutral-800">Size</label>
                          <Input
                            value={variant.size}
                            onChange={(e) => updateVariant(index, "size", e.target.value)}
                            placeholder="M"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
            {message && <p className="text-sm font-semibold text-green-600">{message}</p>}

            <div className="flex items-center justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Create product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
