import { prisma } from "@/lib/db";

type Range = 7 | 30;

export interface MetricSummary {
  visits: number;
  addToCart: number;
  draftOrders: number;
  conversion: number;
}

export interface MetricPoint {
  date: string;
  visits: number;
  addToCart: number;
  orders: number;
}

export interface DashboardMetrics {
  summary: MetricSummary;
  trend: MetricPoint[];
}

export interface DashboardSnapshot {
  last7: DashboardMetrics;
  last30: DashboardMetrics;
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const now = new Date();
  const from30 = startOfDay(subtractDays(now, 29));

  const [hits, addEvents, draftOrders] = await Promise.all([
    prisma.hit.findMany({
      where: { createdAt: { gte: from30 } },
      select: { createdAt: true },
    }),
    prisma.addToCartEvent.findMany({
      where: { createdAt: { gte: from30 } },
      select: { createdAt: true },
    }),
    prisma.order.findMany({
      where: {
        status: "PENDING",
        createdAt: { gte: from30 },
      },
      select: { createdAt: true },
    }),
  ]);

  const baseTrend = buildTrend(now, 30, hits, addEvents, draftOrders);
  const last30 = summarizeTrend(baseTrend);
  const last7Trend = baseTrend.slice(-7);
  const last7 = summarizeTrend(last7Trend);

  return {
    last7: {
      summary: last7.summary,
      trend: last7Trend,
    },
    last30: {
      summary: last30.summary,
      trend: baseTrend,
    },
  };
}

function buildTrend(
  end: Date,
  days: number,
  hits: { createdAt: Date }[],
  addEvents: { createdAt: Date }[],
  orders: { createdAt: Date }[],
): MetricPoint[] {
  const buckets = new Map<string, MetricPoint>();
  const dates = eachDay(end, days);

  dates.forEach((date) => {
    const key = formatDateKey(date);
    buckets.set(key, {
      date: key,
      visits: 0,
      addToCart: 0,
      orders: 0,
    });
  });

  for (const hit of hits) {
    const key = formatDateKey(hit.createdAt);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.visits += 1;
    }
  }

  for (const event of addEvents) {
    const key = formatDateKey(event.createdAt);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.addToCart += 1;
    }
  }

  for (const order of orders) {
    const key = formatDateKey(order.createdAt);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.orders += 1;
    }
  }

  return dates.map((date) => buckets.get(formatDateKey(date))!);
}

function summarizeTrend(trend: MetricPoint[]) {
  const visits = trend.reduce((sum, point) => sum + point.visits, 0);
  const addToCart = trend.reduce((sum, point) => sum + point.addToCart, 0);
  const draftOrders = trend.reduce((sum, point) => sum + point.orders, 0);
  const conversion = visits === 0 ? 0 : +(draftOrders / visits * 100).toFixed(2);

  return {
    summary: {
      visits,
      addToCart,
      draftOrders,
      conversion,
    },
    trend,
  };
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function subtractDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() - days);
  return copy;
}

function eachDay(end: Date, days: number) {
  const result: Date[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = startOfDay(subtractDays(end, i));
    result.push(date);
  }
  return result;
}

function formatDateKey(date: Date) {
  const instance = startOfDay(new Date(date));
  const year = instance.getFullYear();
  const month = `${instance.getMonth() + 1}`.padStart(2, "0");
  const day = `${instance.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}
