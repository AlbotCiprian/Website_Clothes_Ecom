"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
};

type ProductGalleryProps = {
  images: GalleryImage[];
  activeImageId?: string;
  onImageChange?: (imageId: string) => void;
};

export default function ProductGallery({
  images,
  activeImageId,
  onImageChange,
}: ProductGalleryProps) {
  const initialImageId = images[0]?.id;
  const [currentImageId, setCurrentImageId] = useState(activeImageId ?? initialImageId);

  useEffect(() => {
    if (activeImageId && activeImageId !== currentImageId) {
      setCurrentImageId(activeImageId);
    }
  }, [activeImageId, currentImageId]);

  useEffect(() => {
    if (!images.some((image) => image.id === currentImageId)) {
      const fallbackId = images[0]?.id;
      setCurrentImageId(fallbackId);
      if (fallbackId && onImageChange) {
        onImageChange(fallbackId);
      }
    }
  }, [currentImageId, images, onImageChange]);

  const currentImage = useMemo(
    () => images.find((image) => image.id === currentImageId) ?? images[0],
    [currentImageId, images],
  );

  if (!currentImage) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-3xl border border-neutral-200 bg-neutral-100 text-sm text-neutral-500">
        Imagery coming soon.
      </div>
    );
  }

  const handleSelect = (imageId: string) => {
    setCurrentImageId(imageId);
    onImageChange?.(imageId);
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-neutral-200">
        <Image
          key={currentImage.id}
          src={currentImage.src}
          alt={currentImage.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
          priority
        />
      </div>

      {images.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image) => {
            const isActive = image.id === currentImage.id;
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => handleSelect(image.id)}
                className={cn(
                  "relative h-24 w-24 flex-none overflow-hidden rounded-2xl border transition focus:outline-none focus:ring-2 focus:ring-neutral-900/20",
                  isActive
                    ? "border-neutral-900 shadow-sm"
                    : "border-transparent hover:border-neutral-300",
                )}
                aria-pressed={isActive}
                aria-label={`View image for ${image.alt}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
