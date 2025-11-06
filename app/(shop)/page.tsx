import type { Metadata } from "next";

import AddFromLinkHandler, { type LinkAddPayload } from "@/components/AddFromLinkHandler";
import ProductFilters from "@/components/ProductFilters";
import ProductGrid from "@/components/ProductGrid";
import { getProductForCart, getProductList, parseProductListParams } from "@/lib/products";

export const metadata: Metadata = {
  title: "Claroche Shop",
  description:
    "Explore the Claroche ready-to-move collection. Filter by size, color, or price and discover elevated activewear essentials.",
  openGraph: {
    title: "Claroche Shop",
    description:
      "Discover Claroche activewear. Filter by fit, color, or price and shop the latest arrivals.",
  },
};

type ShopPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function toURLSearchParams(input: ShopPageProps["searchParams"]) {
  const params = new URLSearchParams();
  if (!input) return params;

  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((entry) => params.append(key, entry));
    } else if (value) {
      params.append(key, value);
    }
  }

  return params;
}

function buildQueryString(params: URLSearchParams, exclusions: string[] = []) {
  const copy = new URLSearchParams(params.toString());
  for (const exclusion of exclusions) {
    copy.delete(exclusion);
  }
  return copy.toString();
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const urlParams = toURLSearchParams(searchParams);
  const filters = parseProductListParams(urlParams);
  const data = await getProductList(filters);

  const initialQuery = buildQueryString(urlParams, ["page"]);

  const addProductId = urlParams.get("add");
  const addVariantId = urlParams.get("variant") ?? undefined;
  const redirectParam = urlParams.get("redirect");
  const refCode = urlParams.get("ref");

  let autoAddPayload: LinkAddPayload | null = null;

  if (addProductId) {
    const product = await getProductForCart(addProductId);
    if (product) {
      const variant =
        product.variants.find((item) => item.id === addVariantId) ?? product.variants[0];

      if (variant) {
        autoAddPayload = {
          productId: product.id,
          productTitle: product.title,
          productSlug: product.slug,
          trackerCode: refCode,
          variant,
          redirect: redirectParam,
        };
      }
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <AddFromLinkHandler payload={autoAddPayload} />
      <header className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Shop Claroche
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            Browse minimalist silhouettes engineered for movement. Adjust filters to discover the
            perfect fit across our latest drops.
          </p>
        </div>
        <p className="text-sm text-neutral-500" aria-live="polite">
          Showing <span className="font-medium text-neutral-900">{data.items.length}</span> of{" "}
          <span className="font-medium text-neutral-900">{data.pageInfo.totalItems}</span> products
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[280px,1fr]">
        <aside aria-label="Product filters">
          <ProductFilters
            facets={data.facets}
            initialState={{
              sizes: filters.sizes ?? [],
              colors: filters.colors ?? [],
              sort: filters.sort ?? "featured",
              minPrice: filters.minPrice ?? undefined,
              maxPrice: filters.maxPrice ?? undefined,
            }}
          />
        </aside>
        <div>
          <ProductGrid
            initialItems={data.items}
            initialPageInfo={data.pageInfo}
            initialQuery={initialQuery}
          />
        </div>
      </div>
    </section>
  );
}
