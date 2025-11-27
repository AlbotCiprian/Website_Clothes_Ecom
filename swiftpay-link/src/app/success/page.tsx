import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SuccessPage() {
  return (
    <div className="container-shell flex items-center justify-center py-16">
      <Card className="max-w-xl">
        <CardContent className="space-y-4 p-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            swiftpay-link
          </p>
          <h1 className="text-3xl font-semibold text-neutral-900">Payment simulated: success</h1>
          <p className="text-neutral-600">
            Order and payment statuses were updated. In production this would be triggered by the PSP
            callback.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild>
              <Link href="/checkout">Return to checkout</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
