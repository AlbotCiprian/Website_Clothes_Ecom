import type { Metadata } from "next";

import { requireAdminSession } from "@/lib/auth";
import { getDashboardSnapshot } from "@/lib/admin/metrics";

export const metadata: Metadata = {
  title: "Claroche Admin · Dashboard",
};

const numberFormatter = new Intl.NumberFormat("en-US");

export default async function AdminDashboardPage() {
  await requireAdminSession();
  const metrics = await getDashboardSnapshot();

  const cards = [
    {
      label: "Visits (7d)",
      value: numberFormatter.format(metrics.last7.summary.visits),
      secondary: `30d: ${numberFormatter.format(metrics.last30.summary.visits)}`,
    },
    {
      label: "Add to cart (7d)",
      value: numberFormatter.format(metrics.last7.summary.addToCart),
      secondary: `30d: ${numberFormatter.format(metrics.last30.summary.addToCart)}`,
    },
    {
      label: "Draft orders (7d)",
      value: numberFormatter.format(metrics.last7.summary.draftOrders),
      secondary: `30d: ${numberFormatter.format(metrics.last30.summary.draftOrders)}`,
    },
    {
      label: "Conversion %",
      value: `${metrics.last7.summary.conversion.toFixed(2)}%`,
      secondary: `30d: ${metrics.last30.summary.conversion.toFixed(2)}%`,
    },
  ];

  const visitsPath = buildSparklinePath(metrics.last7.trend, "visits", 120, 60);
  const addToCartPath = buildSparklinePath(metrics.last7.trend, "addToCart", 120, 60);

  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">
              Claroche Admin
            </p>
            <h1 className="text-2xl font-semibold text-neutral-900">Performance dashboard</h1>
          </div>
          <p className="text-xs text-neutral-500">
            Tracking visits, carts, and draft orders over the last 7 and 30 days.
          </p>
        </header>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
              <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {card.label}
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-neutral-900">{card.value}</dd>
              <p className="mt-1 text-xs text-neutral-500">{card.secondary}</p>
            </div>
          ))}
        </dl>

        <div className="mt-10 grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-neutral-900">7 day engagement</h2>
            <p className="text-xs text-neutral-500">Daily visits vs. add-to-cart activity</p>
            <div className="mt-6 h-40 overflow-hidden">
              <svg viewBox="0 0 120 60" className="h-full w-full">
                <path
                  d={visitsPath}
                  fill="none"
                  stroke="#111827"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
                <path
                  d={addToCartPath}
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="mt-4 flex gap-6 text-xs text-neutral-500">
              {metrics.last7.trend.map((point) => (
                <div key={point.date} className="flex flex-col">
                  <span className="font-medium text-neutral-900">{formatDay(point.date)}</span>
                  <span>Visits: {point.visits}</span>
                  <span>Add to cart: {point.addToCart}</span>
                </div>
              ))}
            </div>
          </div>

  <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-neutral-900">30 day snapshot</h2>
            <dl className="mt-4 space-y-3 text-sm text-neutral-600">
              <div className="flex items-center justify-between">
                <dt>Total visits</dt>
                <dd className="font-medium text-neutral-900">
                  {numberFormatter.format(metrics.last30.summary.visits)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Total add-to-cart</dt>
                <dd className="font-medium text-neutral-900">
                  {numberFormatter.format(metrics.last30.summary.addToCart)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Draft orders</dt>
                <dd className="font-medium text-neutral-900">
                  {numberFormatter.format(metrics.last30.summary.draftOrders)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Conversion</dt>
                <dd className="font-medium text-neutral-900">
                  {metrics.last30.summary.conversion.toFixed(2)}%
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-sm text-neutral-500">
        <p>
          Draft orders represent checkouts captured by the demo flow. Once live payments are wired,
          conversion will represent paid orders / visits.
        </p>
      </div>
    </section>
  );
}

function buildSparklinePath(
  trend: { date: string; [key: string]: number }[],
  key: "visits" | "addToCart",
  width: number,
  height: number,
) {
  if (trend.length === 0) {
    return "";
  }

  const maxValue = Math.max(...trend.map((point) => point[key]), 1);
  const step = width / Math.max(trend.length - 1, 1);

  return trend
    .map((point, index) => {
      const x = index * step;
      const value = point[key];
      const y = height - (value / maxValue) * (height - 5);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function formatDay(date: string) {
  const [year, month, day] = date.split("-");
  return `${month}/${day}`;
}
