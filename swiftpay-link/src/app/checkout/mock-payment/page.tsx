import Link from "next/link";
import { redirect } from "next/navigation";

import { MockPaymentActions } from "@/components/mock-payment-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams: { orderId?: string };
};

export const dynamic = "force-dynamic";

export default async function MockPaymentPage({ searchParams }: PageProps) {
  const orderId = searchParams.orderId;
  if (!orderId) {
    redirect("/checkout");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      payment: true,
    },
  });

  if (!order) {
    redirect("/checkout");
  }

  const payment = order.payment ?? null;

  return (
    <div className="container-shell space-y-8 py-10">
      <Card className="border-none bg-transparent shadow-none">
        <CardContent className="px-0">
          <Badge variant="muted">Mock payment</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-neutral-900 sm:text-4xl">
            Simulate payment result
          </h1>
          <p className="mt-2 max-w-2xl text-neutral-600">
            This simulates the PSP callback. Choose success or failure to update the order and payment records.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr),minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Order {order.orderNumber ?? order.id.slice(0, 8)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 border-b border-neutral-100 py-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{item.productName}</p>
                    <p className="text-xs text-neutral-500">{item.variantLabel}</p>
                    <p className="text-xs text-neutral-500">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-neutral-900">
                    MDL {(Number(item.unitPrice) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm text-neutral-600">
              <span>Total</span>
              <span className="text-base font-semibold text-neutral-900">
                MDL {Number(order.totalAmount ?? 0).toFixed(2)}
              </span>
            </div>
            {payment ? (
              <p className="text-xs text-neutral-500">
                Current payment status: <span className="font-semibold">{payment.status}</span> (
                {payment.method})
              </p>
            ) : null}
            <MockPaymentActions orderId={order.id} />
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Next steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-neutral-600">
              In a real integration this page would be replaced by a PSP redirect or wallet sheet.
              For now, choose a result to move the order forward.
            </p>
            <Link href="/checkout" className="text-sm font-semibold text-neutral-900 underline">
              Back to checkout
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
