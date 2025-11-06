import Image from "next/image";
import Link from "next/link";

import type { ProductListItem } from "@/lib/products";
import { formatMoney, formatPriceRange } from "@/lib/format";
import AddToCartButton from "@/components/AddToCartButton";

type ProductCardProps = {
  product: ProductListItem;
};

export default function ProductCard({ product }: ProductCardProps) {
  const priceLabel =
    product.minVariantPrice === product.maxVariantPrice
      ? formatMoney(product.minVariantPrice)
      : formatPriceRange(product.minVariantPrice, product.maxVariantPrice) ??
        formatMoney(product.minVariantPrice);

  const firstAvailableVariant =
    product.variants.find((variant) => variant.stock > 0) ?? product.variants[0];
  const ratingLabel =
    typeof product.averageRating === "number" ? product.averageRating.toFixed(1) : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-within:-translate-y-1 focus-within:shadow-lg">
      <Link href={`/product/${product.slug}`} aria-label={`View ${product.title}`} className="relative block aspect-[4/5] overflow-hidden">
        {product.thumbnailUrl ? (
          <Image
            src={product.thumbnailUrl}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            priority={false}
          />
        ) : (
          <div className="grid h-full place-items-center bg-neutral-100 text-neutral-500">
            <span className="text-sm">Image coming soon</span>
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col space-y-3 p-5">
        <div className="space-y-2">
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="text-lg font-medium text-neutral-900 group-hover:underline">
              {product.title}
            </h3>
          </Link>
          {product.description ? (
            <p className="text-sm text-neutral-600 line-clamp-2">{product.description}</p>
          ) : null}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-900">{priceLabel}</p>
          {product.reviewCount > 0 && ratingLabel ? (
            <span className="text-xs text-neutral-500" aria-label={`${product.reviewCount} reviews`}>
              ★ {ratingLabel} · {product.reviewCount}
            </span>
          ) : (
            <span className="text-xs text-neutral-400">Be the first to review</span>
          )}
        </div>
        <AddToCartButton
          productId={product.id}
          productTitle={product.title}
          variant={
            firstAvailableVariant
              ? {
                  id: firstAvailableVariant.id,
                  name: firstAvailableVariant.name,
                  price: firstAvailableVariant.price,
                  stock: firstAvailableVariant.stock,
                  size: firstAvailableVariant.size,
                  color: firstAvailableVariant.color,
                }
              : undefined
          }
          imageUrl={product.thumbnailUrl}
          disabled={!firstAvailableVariant}
          className="mt-auto"
        />
      </div>
    </article>
  );
}
