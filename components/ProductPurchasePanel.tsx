"use client";

import { useEffect, useMemo, useState } from "react";

import AddToCartButton from "@/components/AddToCartButton";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export type PurchaseVariant = {
  id: string;
  name: string;
  price: number;
  stock: number;
  size?: string | null;
  color?: string | null;
  imageUrl?: string | null;
};

type ProductPurchasePanelProps = {
  productId: string;
  productTitle: string;
  description?: string | null;
  variants: PurchaseVariant[];
  selectedVariantId: string | null;
  onVariantChange: (variantId: string) => void;
  onVariantImageChange?: (variant: PurchaseVariant | undefined) => void;
  redirect?: string;
};

export default function ProductPurchasePanel({
  productId,
  productTitle,
  description,
  variants,
  selectedVariantId,
  onVariantChange,
  onVariantImageChange,
  redirect,
}: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);
  const selectedVariant = useMemo(() => {
    if (selectedVariantId) {
      return variants.find((variant) => variant.id === selectedVariantId) ?? variants[0];
    }
    return variants[0];
  }, [selectedVariantId, variants]);

  useEffect(() => {
    if (onVariantChange && !selectedVariantId && variants[0]) {
      onVariantChange(variants[0].id);
    }
  }, [onVariantChange, selectedVariantId, variants]);

  useEffect(() => {
    onVariantImageChange?.(selectedVariant);
  }, [onVariantImageChange, selectedVariant]);

  const priceLabel = selectedVariant ? formatMoney(selectedVariant.price) : "Unavailable";

  const handleQuantityChange = (nextQuantity: number) => {
    if (Number.isNaN(nextQuantity)) return;
    setQuantity(Math.max(1, Math.min(10, nextQuantity)));
  };

  return (
    <div className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">{productTitle}</h1>
        <p className="text-lg font-medium text-neutral-900">{priceLabel}</p>
      </div>

      {description ? <p className="text-sm leading-relaxed text-neutral-600">{description}</p> : null}

      <div className="space-y-3">
        <label htmlFor="variant" className="text-sm font-medium text-neutral-800">
          Select variant
        </label>
        <select
          id="variant"
          name="variant"
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          value={selectedVariant?.id ?? ""}
          onChange={(event) => onVariantChange(event.target.value)}
        >
          {variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.name} · {formatMoney(variant.price)}
            </option>
          ))}
        </select>
        {selectedVariant ? (
          <StockIndicator stock={selectedVariant.stock} />
        ) : (
          <p className="text-xs text-red-500">Please choose a variant.</p>
        )}
      </div>

      <div className="space-y-3">
        <label htmlFor="quantity" className="text-sm font-medium text-neutral-800">
          Quantity
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity - 1)}
            className="h-10 w-10 rounded-full border border-neutral-200 text-lg text-neutral-700 hover:border-neutral-400"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min={1}
            max={10}
            value={quantity}
            onChange={(event) => handleQuantityChange(Number(event.target.value))}
            className="w-16 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-center text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          />
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity + 1)}
            className="h-10 w-10 rounded-full border border-neutral-200 text-lg text-neutral-700 hover:border-neutral-400"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <AddToCartButton
        productId={productId}
        productTitle={productTitle}
        variant={
          selectedVariant
            ? {
                id: selectedVariant.id,
                name: selectedVariant.name,
                price: selectedVariant.price,
                stock: selectedVariant.stock,
                size: selectedVariant.size,
                color: selectedVariant.color,
              }
            : undefined
        }
        imageUrl={selectedVariant?.imageUrl}
        quantity={quantity}
        redirect={redirect}
      />
      <ul className="space-y-2 text-xs text-neutral-500">
        <li>✓ Free returns within 30 days</li>
        <li>✓ Carbon-neutral shipping on all Claroche orders</li>
        <li>✓ Secure checkout — no charges until items ship</li>
      </ul>
    </div>
  );
}

function StockIndicator({ stock }: { stock: number }) {
  const status =
    stock <= 0 ? "Out of stock" : stock < 5 ? "Low stock — ships soon" : "In stock and ready to ship";

  return (
    <p
      className={cn(
        "text-xs font-medium",
        stock <= 0
          ? "text-red-500"
          : stock < 5
            ? "text-amber-600"
            : "text-emerald-600",
      )}
    >
      {status}
    </p>
  );
}
