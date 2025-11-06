"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { addItem } from "@/lib/cart";

export type LinkAddPayload = {
  productId: string;
  productTitle: string;
  productSlug: string;
  trackerCode?: string | null;
  variant?: {
    id: string;
    name: string;
    price: number;
    stock: number;
    size?: string | null;
    color?: string | null;
    imageUrl?: string | null;
  };
  redirect?: string | null;
};

type AddFromLinkHandlerProps = {
  payload?: LinkAddPayload | null;
};

export default function AddFromLinkHandler({ payload }: AddFromLinkHandlerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const processedRef = useRef(false);

  const refCode = searchParams?.get("ref") ?? payload?.trackerCode ?? null;

  const sanitizedUrl = useMemo(() => {
    if (!searchParams) {
      return pathname;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("add");
    params.delete("variant");
    params.delete("ref");
    params.delete("redirect");

    const query = params.toString();
    return query.length ? `${pathname}?${query}` : pathname ?? "/shop";
  }, [pathname, searchParams]);

  const currentUrl = useMemo(() => {
    if (!pathname) return "/shop";
    const query = searchParams?.toString();
    return query && query.length ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (refCode) {
      try {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem("claroche:lastRef", refCode);
          const hitKey = `claroche:hit:${refCode}`;
          if (!window.sessionStorage.getItem(hitKey)) {
            void fetch("/api/links/hit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: refCode }),
              keepalive: true,
            });
            window.sessionStorage.setItem(hitKey, "1");
          }
        }
      } catch (error) {
        console.warn("Unable to record link hit", error);
      }
    }
  }, [refCode]);

  useEffect(() => {
    if (processedRef.current || !payload || !payload.variant) {
      return;
    }

    processedRef.current = true;

    const storageKey = `claroche:autoadd:${payload.productId}:${payload.variant.id}:${refCode ?? "none"}`;

    if (typeof window !== "undefined" && window.sessionStorage.getItem(storageKey)) {
      // already processed in this session
      return;
    }

    try {
      addItem({
        id: `${payload.productId}-${payload.variant.id}`,
        productId: payload.productId,
        variantId: payload.variant.id,
        name: `${payload.productTitle} - ${payload.variant.name}`,
        price: payload.variant.price,
        quantity: 1,
        imageUrl: payload.variant.imageUrl ?? null,
        size: payload.variant.size ?? null,
        color: payload.variant.color ?? null,
      });

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(storageKey, "1");
      }

      void fetch("/api/events/add-to-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: payload.productId,
          variantId: payload.variant.id,
          trackerCode: refCode ?? payload.trackerCode ?? undefined,
        }),
        keepalive: true,
      });
    } catch (error) {
      console.error("Failed to auto add item from link", error);
    } finally {
      if (sanitizedUrl && sanitizedUrl !== currentUrl) {
        router.replace(sanitizedUrl);
      }

      if (payload.redirect) {
        const target =
          payload.redirect === "checkout"
            ? "/checkout"
            : payload.redirect === "pdp"
              ? `/product/${payload.productSlug}`
              : payload.redirect;
        if (target) {
          router.push(target);
        }
      }
    }
  }, [payload, refCode, router, sanitizedUrl, currentUrl]);

  return null;
}
