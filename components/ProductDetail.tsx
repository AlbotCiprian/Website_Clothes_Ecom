"use client";

import { useEffect, useMemo, useState } from "react";

import ProductGallery, { type GalleryImage } from "@/components/ProductGallery";
import ProductPurchasePanel, { type PurchaseVariant } from "@/components/ProductPurchasePanel";
import StickyATC from "@/components/StickyATC";

type ProductDetailProps = {
  productId: string;
  productTitle: string;
  description?: string | null;
  variants: PurchaseVariant[];
  images: GalleryImage[];
  redirect?: string;
};

export default function ProductDetail({
  productId,
  productTitle,
  description,
  variants,
  images,
  redirect,
}: ProductDetailProps) {
  const initialVariantId = variants[0]?.id ?? null;
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(initialVariantId);
  const [activeImageId, setActiveImageId] = useState<string | undefined>(images[0]?.id);

  useEffect(() => {
    if (initialVariantId && selectedVariantId == null) {
      setSelectedVariantId(initialVariantId);
    }
  }, [initialVariantId, selectedVariantId]);

  const selectedVariant = useMemo(
    () => (selectedVariantId ? variants.find((variant) => variant.id === selectedVariantId) : undefined),
    [selectedVariantId, variants],
  );

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
  };

  const handleVariantImageChange = (variant: PurchaseVariant | undefined) => {
    if (!variant?.imageUrl) return;
    const matchingImage = images.find((image) => image.src === variant.imageUrl);
    if (matchingImage) {
      setActiveImageId(matchingImage.id);
    }
  };

  return (
    <>
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <ProductGallery images={images} activeImageId={activeImageId} onImageChange={setActiveImageId} />
        <ProductPurchasePanel
          productId={productId}
          productTitle={productTitle}
          description={description}
          variants={variants}
          selectedVariantId={selectedVariantId}
          onVariantChange={handleVariantChange}
          onVariantImageChange={handleVariantImageChange}
          redirect={redirect}
        />
      </div>
      <StickyATC
        productId={productId}
        productTitle={productTitle}
        variant={selectedVariant}
        redirect={redirect}
      />
    </>
  );
}
