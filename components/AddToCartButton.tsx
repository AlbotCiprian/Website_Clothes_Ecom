"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { addItem } from "@/lib/cart";
import { cn } from "@/lib/utils";

type AddToCartButtonProps = {
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
  quantity?: number;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  buttonVariant?: "default" | "secondary" | "outline" | "ghost";
  imageUrl?: string | null;
  trackerCode?: string;
};

type Status = "idle" | "added" | "error";

export default function AddToCartButton({
  productId,
  productTitle,
  variant,
  quantity = 1,
  disabled,
  className,
  size = "lg",
  buttonVariant = "default",
  imageUrl,
  trackerCode,
}: AddToCartButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const isOutOfStock = useMemo(() => {
    if (!variant) return true;
    return variant.stock <= 0;
  }, [variant]);

  const finalDisabled = disabled || !variant || isOutOfStock || quantity <= 0;
  const label = finalDisabled
    ? isOutOfStock
      ? "Out of stock"
      : "Select options"
    : status === "added"
      ? "Added!"
      : "Add to cart";

  const handleAdd = async () => {
    if (finalDisabled || !variant) {
      return;
    }

    try {
      setIsPending(true);
      addItem({
        id: `${productId}-${variant.id}`,
        productId,
        variantId: variant.id,
        name: `${productTitle} - ${variant.name}`,
        price: variant.price,
        quantity,
        imageUrl,
        size: variant.size,
        color: variant.color,
      });

      trackAddToCart(productId, variant.id, trackerCode);

      setStatus("added");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setStatus("idle"), 2500);
    } catch (error) {
      console.error("Failed to add to cart", error);
      setStatus("error");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Button
        type="button"
        size={size}
        variant={buttonVariant}
        disabled={finalDisabled || isPending}
        onClick={handleAdd}
        aria-live="assertive"
        aria-busy={isPending}
        className="w-full"
      >
        {label}
      </Button>
      <span className="sr-only" role="status">
        {status === "added" ? `${productTitle} added to cart` : null}
        {status === "error" ? "Unable to add this product to cart" : null}
      </span>
    </div>
  );
}

function trackAddToCart(productId: string, variantId?: string, trackerCode?: string) {
  try {
    const storedCode =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem("claroche:lastRef") ?? undefined
        : undefined;

    const payload = {
      productId,
      variantId,
      trackerCode: trackerCode ?? storedCode ?? undefined,
    };

    void fetch("/api/events/add-to-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (error) {
    console.warn("Unable to track add to cart event", error);
  }
}
