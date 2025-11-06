import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Order received · Claroche",
  description: "Thank you for exploring the Claroche demo checkout experience.",
};

export default function SuccessPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">
        Claroche
      </div>
      <h1 className="mt-6 text-3xl font-semibold text-neutral-900 sm:text-4xl">
        Order confirmed — thank you!
      </h1>
      <p className="mt-4 max-w-2xl text-sm text-neutral-600">
        This demo checkout mimics the Claroche fulfillment flow. A confirmation email would be on
        its way, and you could track your shipment once it leaves our studio.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button asChild size="lg">
          <Link href="/shop">Continue shopping</Link>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </section>
  );
}
