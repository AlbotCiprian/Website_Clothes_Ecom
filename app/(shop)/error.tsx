"use client";

import Link from "next/link";
import { useEffect } from "react";

type ShopErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ShopError({ error, reset }: ShopErrorProps) {
  useEffect(() => {
    console.error("Shop route error:", error);
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">
        Claroche
      </p>
      <h1 className="mt-4 text-3xl font-semibold text-neutral-900 sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-xl text-sm text-neutral-600">
        Our team has been notified. Try refreshing the page or head back to the shop homepage.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-neutral-900 px-5 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
        >
          Try again
        </button>
        <Link className="text-sm text-neutral-600 hover:text-neutral-900" href="/shop">
          Browse the shop
        </Link>
      </div>
    </section>
  );
}
