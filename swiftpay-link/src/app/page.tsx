import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container-shell">
      <section className="grid gap-10 py-10 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
        <div className="space-y-6">
          <Badge variant="muted">Checkout by link</Badge>
          <h1 className="text-4xl font-bold leading-tight text-neutral-900 sm:text-5xl">
            swiftpay-link drops your customers directly into checkout.
          </h1>
          <p className="text-lg text-neutral-600">
            Sellers craft a short link. Customers click, land on a preloaded cart, confirm delivery, pay. Faster than any shop chat flow.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link href="/checkout">Preview checkout</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/c/DEMO123" className="flex items-center gap-2">
                Try demo link <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <ul className="grid gap-3 text-sm text-neutral-700 sm:grid-cols-2">
            <li className="flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-3 shadow-sm ring-1 ring-neutral-200">
              <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
              Server-side carts tied to a cookie token
            </li>
            <li className="flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-3 shadow-sm ring-1 ring-neutral-200">
              <span className="h-2 w-2 rounded-full bg-neutral-900" aria-hidden />
              Link resolver hydrates carts in one hop
            </li>
            <li className="flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-3 shadow-sm ring-1 ring-neutral-200">
              <span className="h-2 w-2 rounded-full bg-neutral-900" aria-hidden />
              Checkout UI mirrors Claroche styling
            </li>
            <li className="flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-3 shadow-sm ring-1 ring-neutral-200">
              <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
              Ready for payments + MUVI in later milestones
            </li>
          </ul>
        </div>

        <Card className="relative overflow-hidden">
          <CardContent className="p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Claroche-inspired look
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-neutral-900">
              Minimal, clean, movement-first.
            </h2>
            <p className="mt-3 text-neutral-600">
              Rounded cards, soft neutrals, confident typography. The checkout keeps the same vibe customers already like.
            </p>
            <div className="mt-8 grid gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4">
              <div className="flex items-center justify-between text-sm font-medium text-neutral-900">
                <span>Motion Tee</span>
                <span>$39.00</span>
              </div>
              <div className="flex items-center justify-between text-sm font-medium text-neutral-900">
                <span>Flow Jogger (2)</span>
                <span>$138.00</span>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-neutral-200 pt-3 text-sm font-semibold text-neutral-900">
                <span>Cart total</span>
                <span>$177.00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
