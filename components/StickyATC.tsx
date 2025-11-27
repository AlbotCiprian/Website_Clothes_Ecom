"use client";

import { useEffect, useState } from "react";

import AddToCartButton from "@/components/AddToCartButton";
import { formatMoney } from "@/lib/format";

type StickyATCProps = {
  productId: string;
  productTitle: string;
  variant?: {
    id: string;
    name: string;
    price: number;
    stock: number;
    size?: string | null;
    color?: string | null;
  };
  redirect?: string;
};

export default function StickyATC({ productId, productTitle, variant, redirect }: StickyATCProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = () => {
      setIsVisible(window.scrollY > 320);
    };

    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (!variant) {
    return null;
  }

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden ${
        isVisible ? "translate-y-0" : "translate-y-full"
      } transition`}
      role="complementary"
      aria-label="Quick add to cart"
    >
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-neutral-900">{variant.name}</p>
          <p className="text-xs text-neutral-500">{formatMoney(variant.price)}</p>
        </div>
        <AddToCartButton
          productId={productId}
          productTitle={productTitle}
          variant={variant}
          size="default"
          redirect={redirect}
        />
      </div>
    </div>
  );
}
