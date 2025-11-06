import type { Metadata } from "next";

import CheckoutForm from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout · Claroche",
  description:
    "Complete your Claroche order. This demo checkout validates shipping details without collecting payment.",
};

export default function CheckoutPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">Claroche</p>
        <h1 className="text-3xl font-semibold text-neutral-900 sm:text-4xl">Checkout</h1>
        <p className="mx-auto max-w-2xl text-sm text-neutral-600">
          Securely review your contact details and confirm your shipment preferences. Payments are
          disabled in this demo flow — no card information is collected.
        </p>
      </header>
      <CheckoutForm />
    </section>
  );
}
