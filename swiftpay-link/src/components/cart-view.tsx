"use client";

import { useCallback, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CartPayload } from "@/lib/cart";
import { cn } from "@/lib/utils";

type CartViewProps = {
  initialCart: CartPayload;
};

export function CartView({ initialCart }: CartViewProps) {
  const [cart, setCart] = useState<CartPayload>(initialCart);
  const [isPending, startTransition] = useTransition();
  const cartEmpty = cart.items.length === 0;

  const refreshCart = useCallback(async () => {
    const res = await fetch("/api/cart", { cache: "no-store" });
    const data = (await res.json()) as { cart: CartPayload };
    setCart(data.cart);
  }, []);

  const updateQuantity = useCallback(
    (productVariantId: string, quantity: number) => {
      startTransition(async () => {
        await fetch("/api/cart/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productVariantId, quantity }),
        });
        await refreshCart();
      });
    },
    [refreshCart],
  );

  const clearCart = useCallback(() => {
    startTransition(async () => {
      await fetch("/api/cart", { method: "DELETE" });
      await refreshCart();
    });
  }, [refreshCart]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr),minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Cart items</CardTitle>
          <CardDescription>Preloaded from the shared checkout link.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cartEmpty ? (
            <p className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center text-neutral-600">
              Cart is empty. Load a link or add an item via the API.
            </p>
          ) : (
            <ul className="space-y-3">
              {cart.items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-neutral-900">{item.productName}</p>
                    <p className="text-xs text-neutral-500">{item.variantLabel}</p>
                    <p className="text-sm font-medium text-neutral-900">
                      ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <QuantityPill
                      value={item.quantity}
                      disabled={isPending}
                      onChange={(next) => updateQuantity(item.productVariantId, next)}
                    />
                    <p className="text-sm font-semibold text-neutral-900">
                      ${(item.lineTotal).toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>In a later milestone this feeds delivery & payments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-neutral-600">
            <span>Items</span>
            <span>{cart.totals.itemCount}</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold text-neutral-900">
            <span>Subtotal</span>
            <span>${cart.totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="grid gap-3 pt-2">
            <Button variant="secondary" onClick={refreshCart} disabled={isPending}>
              Refresh cart
            </Button>
            <Button variant="outline" onClick={clearCart} disabled={isPending || cartEmpty}>
              Clear cart
            </Button>
          </div>
          <p className="text-xs text-neutral-500">
            Delivery steps and payment methods (MIA / Card / ApplePay / GooglePay) will plug in next.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

type QuantityPillProps = {
  value: number;
  disabled?: boolean;
  onChange: (next: number) => void;
};

function QuantityPill({ value, disabled, onChange }: QuantityPillProps) {
  const handleStep = (delta: number) => {
    const next = Math.max(1, value + delta);
    onChange(next);
  };

  return (
    <div
      className={cn(
        "flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-sm font-medium",
        disabled && "opacity-60",
      )}
    >
      <button
        type="button"
        onClick={() => handleStep(-1)}
        disabled={disabled || value <= 1}
        className="px-2 text-neutral-700 transition hover:text-neutral-900 disabled:opacity-40"
      >
        -
      </button>
      <span className="min-w-[2rem] text-center text-neutral-900">{value}</span>
      <button
        type="button"
        onClick={() => handleStep(1)}
        disabled={disabled || value >= 99}
        className="px-2 text-neutral-700 transition hover:text-neutral-900 disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
