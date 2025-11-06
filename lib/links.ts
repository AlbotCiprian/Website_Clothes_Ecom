import type { LinkTracker } from "@prisma/client";

import { prisma } from "@/lib/db";

export async function findLinkByCode(code: string) {
  return prisma.linkTracker.findUnique({
    where: { code },
    include: {
      product: {
        select: { id: true, slug: true },
      },
      variant: {
        select: { id: true },
      },
    },
  });
}

export async function recordLinkHit({
  code,
  ipAddress,
  userAgent,
  referer,
}: {
  code: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  referer?: string | null;
}) {
  const tracker = await prisma.linkTracker.findUnique({
    where: { code },
    select: { id: true },
  });

  if (!tracker) {
    return null;
  }

  await prisma.hit.create({
    data: {
      trackerId: tracker.id,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      referer: referer ?? null,
    },
  });

  return tracker;
}

export async function recordAddToCartEvent({
  productId,
  variantId,
  trackerCode,
}: {
  productId: string;
  variantId?: string;
  trackerCode?: string;
}) {
  let trackerId: string | undefined;

  if (trackerCode) {
    const tracker = await prisma.linkTracker.findUnique({
      where: { code: trackerCode },
      select: { id: true },
    });
    trackerId = tracker?.id;
  }

  await prisma.addToCartEvent.create({
    data: {
      productId,
      variantId: variantId ?? null,
      trackerId: trackerId ?? null,
    },
  });
}
