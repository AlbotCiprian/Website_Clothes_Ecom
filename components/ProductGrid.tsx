"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import ProductCard from "@/components/ProductCard";
import type { ProductListItem, ProductListResponse } from "@/lib/products";
import { cn } from "@/lib/utils";

type ProductGridProps = {
  initialItems: ProductListItem[];
  initialPageInfo: ProductListResponse["pageInfo"];
  initialQuery: string;
};

function createParams(baseQuery: string) {
  return new URLSearchParams(baseQuery);
}

export default function ProductGrid({
  initialItems,
  initialPageInfo,
  initialQuery,
}: ProductGridProps) {
  const [items, setItems] = useState<ProductListItem[]>(initialItems);
  const [pageInfo, setPageInfo] = useState(initialPageInfo);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setItems(initialItems);
    setPageInfo(initialPageInfo);
    setIsLoadingMore(false);
    setError(null);
  }, [initialItems, initialPageInfo]);

  const baseParams = useMemo(() => createParams(initialQuery), [initialQuery]);

  const fetchNextPage = useCallback(async () => {
    if (isLoadingMore || !pageInfo.hasNextPage) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);

    try {
      const params = createParams(initialQuery);
      params.set("page", String(pageInfo.page + 1));
      params.set("take", String(pageInfo.take));

      const response = await fetch(`/api/products?${params.toString()}`, {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Unexpected status ${response.status}`);
      }

      const data: ProductListResponse = await response.json();
      setItems((prev) => [...prev, ...data.items]);
      setPageInfo(data.pageInfo);
    } catch (err) {
      console.error("Failed to load more products", err);
      setError("Unable to load more products. Try again.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [initialQuery, isLoadingMore, pageInfo]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !pageInfo.hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, pageInfo.hasNextPage]);

  const buildPageLink = useCallback(
    (page: number) => {
      const params = new URLSearchParams(baseParams.toString());
      if (page <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(page));
      }

      return params.toString().length ? `${pathname}?${params.toString()}` : pathname;
    },
    [baseParams, pathname],
  );

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center">
        <h2 className="text-xl font-semibold text-neutral-900">No results found</h2>
        <p className="mt-3 text-sm text-neutral-600">
          Adjust filters or explore the full collection to discover new arrivals.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {isLoadingMore
          ? Array.from({ length: Math.min(3, pageInfo.take) }).map((_, index) => (
              <ProductCardSkeleton key={`skeleton-${pageInfo.page}-${index}`} />
            ))
          : null}
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      <div ref={sentinelRef} aria-hidden="true" />

      <nav
        aria-label="Pagination"
        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600"
      >
        <span>
          Page <span className="font-medium text-neutral-900">{pageInfo.page}</span> of{" "}
          <span className="font-medium text-neutral-900">{pageInfo.totalPages}</span>
        </span>
        <div className="flex items-center gap-2">
          <PaginationLink href={buildPageLink(pageInfo.page - 1)} disabled={!pageInfo.hasPreviousPage}>
            Previous
          </PaginationLink>
          <PaginationLink href={buildPageLink(pageInfo.page + 1)} disabled={!pageInfo.hasNextPage}>
            Next
          </PaginationLink>
        </div>
      </nav>
    </div>
  );
}

function PaginationLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-lg border border-neutral-200 px-3 py-1.5 text-neutral-400">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="rounded-lg border border-neutral-200 px-3 py-1.5 text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
    >
      {children}
    </Link>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white">
      <div className="aspect-[4/5] w-full bg-neutral-100" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 rounded bg-neutral-100" />
        <div className="h-3 w-full rounded bg-neutral-100" />
        <div className="h-10 w-full rounded bg-neutral-100" />
      </div>
    </div>
  );
}
