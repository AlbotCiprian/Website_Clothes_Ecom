export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface SeoProduct {
  name: string;
  description?: string | null;
  images: string[];
  price: number;
  currency: string;
  sku?: string | null;
  url: string;
  brand?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  reviewCount?: number;
  ratingValue?: number;
  breadcrumbs?: BreadcrumbItem[];
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildProductJsonLd(product: SeoProduct) {
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku ?? undefined,
    brand: product.brand
      ? {
          "@type": "Brand",
          name: product.brand,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      url: product.url,
      priceCurrency: product.currency,
      price: (product.price / 100).toFixed(2),
      availability: product.availability
        ? `https://schema.org/${product.availability}`
        : "https://schema.org/InStock",
    },
  };

  if (product.reviewCount && product.reviewCount > 0 && product.ratingValue) {
    base.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.ratingValue,
      reviewCount: product.reviewCount,
    };
  }

  if (product.breadcrumbs?.length) {
    base.isRelatedTo = buildBreadcrumbJsonLd(product.breadcrumbs);
  }

  return base;
}
