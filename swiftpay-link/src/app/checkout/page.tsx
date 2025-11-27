import { redirect } from "next/navigation";

import { CheckoutFlow } from "@/components/checkout-flow";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCart, getOrCreateCart } from "@/lib/cart";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const cartRecord = await getOrCreateCart();
  const cart = await getCart(cartRecord.id);

  // If cart record is gone for some reason, reset
  if (!cart.id) {
    await prisma.cart.deleteMany({ where: { id: cartRecord.id } }).catch(() => null);
    redirect("/checkout");
  }

  return (
    <div className="container-shell space-y-8 py-10">
      <Card className="border-none bg-transparent shadow-none">
        <CardContent className="px-0">
          <Badge variant="muted">Checkout</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-neutral-900 sm:text-4xl">
            Three quick steps to confirm.
          </h1>
          <p className="mt-2 max-w-2xl text-neutral-600">
            Review cart, add delivery details, choose a payment option. Payments are mocked in this phase.
          </p>
        </CardContent>
      </Card>

      <CheckoutFlow initialCart={cart} />
    </div>
  );
}
