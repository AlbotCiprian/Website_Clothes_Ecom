"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export type HomeProduct = {
  id: string;
  slug: string;
  title: string;
  price: number;
  thumbnailUrl: string | null;
  badge?: string;
  variants: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
    size?: string | null;
    color?: string | null;
    imageUrl?: string | null;
  }>;
};

type ProductTileProps = {
  product: HomeProduct;
  variantLabel?: "women" | "men";
};

export default function ProductTile({ product, variantLabel }: ProductTileProps) {
  const primaryVariant = product.variants[0];

  return (
    <article className="group relative flex h-full w-64 flex-shrink-0 flex-col overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:w-72">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[3/4] overflow-hidden">
        <Image
          src={product.thumbnailUrl ?? "/images/placeholder.svg"}
          alt={product.title}
          fill
          sizes="288px"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-4 flex justify-between px-4 text-xs font-semibold uppercase tracking-wide">
          <span className="rounded-full bg-white/95 px-3 py-1 text-neutral-900 shadow-sm">
            {product.badge ?? "New Drop"}
          </span>
          <button
            type="button"
            aria-label="Save for later"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-neutral-700 transition hover:bg-white"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 px-4 py-5">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-neutral-500">
          <span>{variantLabel === "men" ? "Mens" : "Womens"}</span>
          {primaryVariant?.color ? <span>{primaryVariant.color}</span> : null}
        </div>
        <Link href={`/product/${product.slug}`} className="line-clamp-2 text-lg font-semibold text-neutral-900">
          {product.title}
        </Link>
        <p className="text-sm text-neutral-500">
          {primaryVariant?.name ?? "One size"} · {primaryVariant?.stock ?? 0} in stock
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-base font-semibold text-neutral-900">
            {formatMoney(product.price, { currency: "USD" })}
          </span>
          {primaryVariant ? (
            <AddToCartButton
              productId={product.id}
              productTitle={product.title}
              variant={{
                id: primaryVariant.id,
                name: primaryVariant.name,
                price: primaryVariant.price,
                stock: primaryVariant.stock,
                size: primaryVariant.size,
                color: primaryVariant.color,
              }}
              quantity={1}
              size="sm"
              buttonVariant="secondary"
            />
          ) : (
            <span className="rounded-full border border-neutral-200 px-4 py-2 text-xs uppercase text-neutral-400">
              Coming soon
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
