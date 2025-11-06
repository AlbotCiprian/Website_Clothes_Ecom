import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductDetail from "@/components/ProductDetail";
import UspBadges from "@/components/UspBadges";
import Faq from "@/components/Faq";
import ReviewList from "@/components/ReviewList";
import ReviewForm from "@/components/ReviewForm";
import { getProductBySlug } from "@/lib/products";
import type { PurchaseVariant } from "@/components/ProductPurchasePanel";
import type { GalleryImage } from "@/components/ProductGallery";
import { buildBreadcrumbJsonLd, buildProductJsonLd } from "@/lib/seo";

type ProductPageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return { title: "Product not found · Claroche" };
  }

  return {
    title: `${product.title} · Claroche`,
    description: product.description ?? "Claroche elevated activewear crafted for movement.",
    openGraph: {
      title: product.title,
      description: product.description ?? "Claroche elevated activewear crafted for movement.",
      images: product.thumbnailUrl ? [{ url: product.thumbnailUrl }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const variants: PurchaseVariant[] = product.variants.map((variant) => ({
    id: variant.id,
    name: variant.name,
    price: variant.price,
    stock: variant.stock,
    size: variant.size,
    color: variant.color,
    imageUrl: variant.imageUrl ?? undefined,
  }));

  const uniqueImages = new Map<string, GalleryImage>();

  if (product.thumbnailUrl) {
    uniqueImages.set(product.thumbnailUrl, {
      id: "thumbnail",
      src: product.thumbnailUrl,
      alt: `${product.title} hero image`,
    });
  }

  product.variants.forEach((variant) => {
    if (variant.imageUrl && !uniqueImages.has(variant.imageUrl)) {
      uniqueImages.set(variant.imageUrl, {
        id: `variant-${variant.id}`,
        src: variant.imageUrl,
        alt: `${product.title} - ${variant.name}`,
      });
    }
  });

  const galleryImages = Array.from(uniqueImages.values());

  const reviewCount = product.reviews.length;
  const averageRating =
    reviewCount > 0
      ? Number(
          (
            product.reviews.reduce((acc, review) => acc + review.rating, 0) / reviewCount
          ).toFixed(1),
        )
      : undefined;

  const reviews = product.reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    title: review.title,
    body: review.body,
    authorName: review.authorName,
    createdAt: review.createdAt.toISOString(),
  }));

  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Shop", url: `${siteUrl}/shop` },
    { name: product.title, url: `${siteUrl}/product/${product.slug}` },
  ]);

  const productJsonLd = buildProductJsonLd({
    name: product.title,
    description: product.description,
    images: galleryImages.map((image) => image.src),
    price: product.price,
    currency: product.currency ?? "USD",
    sku: variants[0]?.id,
    url: `${siteUrl}/product/${product.slug}`,
    reviewCount,
    ratingValue: averageRating,
    breadcrumbs: [
      { name: "Shop", url: `${siteUrl}/shop` },
      { name: product.title, url: `${siteUrl}/product/${product.slug}` },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbs),
        }}
      />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <ProductDetail
          productId={product.id}
          productTitle={product.title}
          description={product.description}
          variants={variants}
          images={galleryImages}
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
          <ReviewList reviews={reviews} />
          <div className="space-y-10">
            <UspBadges />
            <Faq />
            <ReviewForm productId={product.id} />
          </div>
        </div>
      </section>
    </>
  );
}
