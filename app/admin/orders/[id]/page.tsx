import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

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

type OrderPageProps = {
  params: { id: string };
};

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const session = await getServerAuthSession();
  const admin = isAdmin(session);
  if (!admin) {
    return <p className="text-center text-sm text-neutral-600">Admin access required.</p>;
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      payment: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Order {order.orderNumber ?? order.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-neutral-600">Created {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
              statusClasses[order.status] ?? "bg-neutral-100 text-neutral-800",
            )}
          >
            {order.status}
          </span>
          {order.payment ? (
            <span className="inline-flex rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white">
              {order.payment.status}
            </span>
          ) : null}
        </div>
      </div>

      <section className="grid gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Customer</h2>
          <p className="text-sm text-neutral-700">{order.customerName ?? "N/A"}</p>
          <p className="text-xs text-neutral-500">{order.customerEmail}</p>
          <p className="text-xs text-neutral-500">{order.customerPhone}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Delivery</h2>
          <p className="text-sm text-neutral-700">
            {order.deliveryMethod ?? "N/A"} • {order.deliveryCity ?? ""} {order.deliveryZip ?? ""}
          </p>
          <p className="text-sm text-neutral-700">{order.deliveryAddress ?? ""}</p>
          {order.customerNote ? <p className="text-xs text-neutral-500">Note: {order.customerNote}</p> : null}
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">Items</h2>
        <ul className="mt-4 space-y-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-sm">
              <div>
                <p className="font-semibold text-neutral-900">{item.productName}</p>
                <p className="text-xs text-neutral-500">{item.variantLabel}</p>
                <p className="text-xs text-neutral-500">Qty {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-neutral-900">
                {formatMoney(item.lineTotal ?? item.unitPrice * item.quantity, order.currency ?? "USD")}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Totals</h2>
          <p className="text-sm text-neutral-700">
            Subtotal: {formatMoney(order.subtotal ?? order.total ?? 0, order.currency ?? "USD")}
          </p>
          <p className="text-sm text-neutral-700">
            Delivery: {formatMoney(order.deliveryFee ?? 0, order.currency ?? "USD")}
          </p>
          <p className="text-sm font-semibold text-neutral-900">
            Total: {formatMoney(order.totalAmount ?? order.total ?? 0, order.currency ?? "USD")}
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Payment</h2>
          {order.payment ? (
            <div className="space-y-1 text-sm text-neutral-700">
              <p>Method: {order.payment.method}</p>
              <p>Status: {order.payment.status}</p>
              <p>Amount: {formatMoney(order.payment.amount, order.payment.currency ?? "USD")}</p>
            </div>
          ) : (
            <p className="text-sm text-neutral-600">No payment record</p>
          )}
          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold text-neutral-900">Update order status</p>
            <StatusForm orderId={order.id} currentStatus={order.status} />
          </div>
        </div>
      </section>
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

function StatusForm({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const statuses = ["PENDING_PAYMENT", "PENDING", "PAID", "FAILED", "CANCELED"];

  async function updateStatus(formData: FormData) {
    "use server";
    const status = formData.get("status")?.toString();
    if (!status) return;
    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
  }

  return (
    <form action={updateStatus} className="flex items-center gap-3">
      <select
        name="status"
        defaultValue={currentStatus}
        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800"
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-full bg-neutral-900 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800"
      >
        Save
      </button>
    </form>
  );
}
