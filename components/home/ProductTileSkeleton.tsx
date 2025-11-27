"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ProductTileSkeletonProps = {
  className?: string;
};

export default function ProductTileSkeleton({ className }: ProductTileSkeletonProps) {
  return (
    <div
      className={cn(
        "h-full w-64 flex-shrink-0 animate-pulse overflow-hidden rounded-[28px] border border-neutral-200 bg-white sm:w-72",
        className,
      )}
    >
      <div className="flex h-full flex-col">
        <div className="aspect-[3/4] w-full bg-neutral-100" />
        <div className="flex flex-1 flex-col gap-3 px-4 py-5">
          <div className="h-3 w-20 rounded bg-neutral-100" />
          <div className="h-5 w-44 rounded bg-neutral-100" />
          <div className="h-3 w-28 rounded bg-neutral-100" />
          <div className="mt-auto flex items-center justify-between">
            <div className="h-5 w-16 rounded bg-neutral-100" />
            <div className="h-9 w-24 rounded-full bg-neutral-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
