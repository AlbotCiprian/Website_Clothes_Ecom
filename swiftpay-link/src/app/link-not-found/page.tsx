import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LinkNotFoundPage() {
  return (
    <div className="container-shell py-16">
      <Card className="max-w-2xl">
        <CardContent className="space-y-4 p-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            swiftpay-link
          </p>
          <h1 className="text-3xl font-semibold text-neutral-900">This link is not available</h1>
          <p className="text-neutral-600">
            The campaign may be inactive or expired. Please contact the seller for a fresh link.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild>
              <Link href="/">Go home</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/checkout">View checkout</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
