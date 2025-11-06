import type { Metadata } from "next";

import CartView from "@/components/CartView";

export const metadata: Metadata = {
  title: "Your cart · Claroche",
  description:
    "Review the pieces in your Claroche cart and continue to checkout when you're ready.",
};

export default function CartPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">
          Claroche
        </p>
        <h1 className="text-3xl font-semibold text-neutral-900 sm:text-4xl">Your cart</h1>
        <p className="mx-auto max-w-2xl text-sm text-neutral-600">
          Items remain reserved for 30 minutes. Checkout when you're ready — you can update sizing
          or color directly from this page.
        </p>
      </header>
      <CartView />
    </section>
  );
}
