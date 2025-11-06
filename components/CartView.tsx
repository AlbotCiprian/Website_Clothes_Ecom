"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  cartTotals,
  readCart,
  removeItem,
  setItemQuantity,
  subscribe,
  type CartSnapshot,
} from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function CartView() {
  const [cart, setCart] = useState<CartSnapshot>(() => readCart());

  useEffect(() => {
    setCart(readCart());
    const unsubscribe = subscribe((nextCart) => setCart(nextCart));
    return unsubscribe;
  }, []);

  const totals = cartTotals(cart);

  if (cart.items.length === 0) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-neutral-900">Your cart is empty</h2>
        <p className="mt-4 text-sm text-neutral-600">
          Explore the Claroche collection and curate your movement essentials.
        </p>
        <Button asChild className="mt-6">
          <Link href="/shop">Browse the shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
      <section aria-labelledby="cart-heading" className="space-y-6">
        <h2 id="cart-heading" className="text-xl font-semibold text-neutral-900">
          Items in your cart
        </h2>
        <ul className="space-y-6">
          {cart.items.map((item) => (
            <li
              key={`${item.productId}-${item.variantId}`}
              className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:gap-6"
            >
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-neutral-900">{item.name}</h3>
                <p className="text-xs text-neutral-500">
                  {item.size ? `Size ${item.size}` : null}
                  {item.size && item.color ? " · " : null}
                  {item.color ?? null}
                </p>
                <p className="text-sm font-medium text-neutral-900">{formatMoney(item.price)}</p>
              </div>
              <div className="mt-4 flex items-center gap-4 sm:mt-0">
                <QuantityControl
                  quantity={item.quantity}
                  onChange={(next) => setItemQuantity(item.productId, item.variantId, next)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.productId, item.variantId)}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <aside className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900">Order summary</h2>
        <dl className="space-y-3 text-sm text-neutral-600">
          <div className="flex items-center justify-between">
            <dt>Items</dt>
            <dd>{totals.itemCount}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>Subtotal</dt>
            <dd className="font-semibold text-neutral-900">{formatMoney(totals.subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>Shipping</dt>
            <dd className="text-neutral-500">Calculated at checkout</dd>
          </div>
        </dl>
        <Button asChild size="lg" className="w-full">
          <Link href="/checkout">Proceed to checkout</Link>
        </Button>
        <p className="text-xs text-neutral-500">
          Taxes are calculated during checkout. You will not be charged until your order ships.
        </p>
      </aside>
    </div>
  );
}

function QuantityControl({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (next: number) => void;
}) {
  const handleUpdate = (delta: number) => {
    const next = Math.max(1, Math.min(10, quantity + delta));
    onChange(next);
  };

  return (
    <div className="flex items-center rounded-full border border-neutral-200">
      <button
        type="button"
        onClick={() => handleUpdate(-1)}
        className={cn(
          "h-9 w-9 text-lg text-neutral-700",
          quantity <= 1 ? "cursor-not-allowed opacity-40" : "hover:text-neutral-900",
        )}
        aria-label="Decrease quantity"
        disabled={quantity <= 1}
      >
        −
      </button>
      <span className="w-10 text-center text-sm font-medium text-neutral-800">{quantity}</span>
      <button
        type="button"
        onClick={() => handleUpdate(1)}
        className={cn(
          "h-9 w-9 text-lg text-neutral-700",
          quantity >= 10 ? "cursor-not-allowed opacity-40" : "hover:text-neutral-900",
        )}
        aria-label="Increase quantity"
        disabled={quantity >= 10}
      >
        +
      </button>
    </div>
  );
}
