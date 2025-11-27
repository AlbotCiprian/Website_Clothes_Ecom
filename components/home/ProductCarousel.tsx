"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import ProductTile, { type HomeProduct } from "@/components/home/ProductTile";
import ProductTileSkeleton from "@/components/home/ProductTileSkeleton";
import { cn } from "@/lib/utils";

type ProductCarouselProps = {
  eyebrow: string;
  title: string;
  viewAllHref?: string;
  products: HomeProduct[];
  isLoading?: boolean;
  variantLabel?: "women" | "men";
};

export default function ProductCarousel({
  eyebrow,
  title,
  viewAllHref,
  products,
  isLoading,
  variantLabel,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "prev" | "next") => {
    const container = scrollRef.current;
    if (!container) return;

    const cardWidth = container.firstElementChild?.clientWidth ?? 280;
    const offset = direction === "next" ? cardWidth * 1.1 : -cardWidth * 1.1;

    container.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-neutral-900">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Previous products"
            onClick={() => handleScroll("prev")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next products"
            onClick={() => handleScroll("next")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {viewAllHref ? (
            <a
              href={viewAllHref}
              className="ml-2 text-sm font-semibold text-neutral-900 underline-offset-4 hover:underline"
            >
              View all
            </a>
          ) : null}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
        style={{ scrollbarWidth: "none" }}
      >
        <AnimatePresence initial={false}>
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => <ProductTileSkeleton key={index} />)
            : products.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.35 }}
                  className={cn("snap-start")}
                >
                  <ProductTile product={product} variantLabel={variantLabel} />
                </motion.div>
              ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
