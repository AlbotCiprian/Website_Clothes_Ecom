import Link from "next/link";

import { getServerAuthSession, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

const statusClasses: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  PENDING_PAYMENT: "bg-amber-100 text-amber-900",
  PAID: "bg-emerald-100 text-emerald-900",
  FAILED: "bg-rose-100 text-rose-900",
  CANCELED: "bg-neutral-200 text-neutral-800",
};

export default async function OrdersPage() {
  const session = await getServerAuthSession();
  const admin = isAdmin(session);

  if (!admin) {
    return <p className="text-center text-sm text-neutral-600">Admin access required.</p>;
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Orders</h1>
        <p className="text-sm text-neutral-600">Newest orders first. Click to view details.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm text-neutral-800">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-semibold text-neutral-900 underline">
                    {order.orderNumber ?? order.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium">{order.customerName ?? "N/A"}</span>
                    <span className="text-xs text-neutral-500">{order.customerEmail ?? ""}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {formatMoney(order.total ?? order.totalAmount ?? 0, order.currency ?? "USD")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                      statusClasses[order.status] ?? "bg-neutral-100 text-neutral-800",
                    )}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-600 text-xs">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                  No orders found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
}
