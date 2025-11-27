import type { Metadata } from "next";

import AddFromLinkHandler, { type LinkAddPayload } from "@/components/AddFromLinkHandler";
import HeroSection from "@/components/home/HeroSection";
import ProductCarousel from "@/components/home/ProductCarousel";
import type { HomeProduct } from "@/components/home/ProductTile";
import { getProductForCart, getProductList } from "@/lib/products";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Claroche Shop",
  description:
    "Explore the Claroche ready-to-move collection. Filter by size, color, or price and discover elevated activewear essentials.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Claroche Shop",
    description:
      "Discover Claroche activewear. Filter by fit, color, or price and shop the latest arrivals.",
    url: `${siteUrl}/shop`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Claroche Shop",
    description:
      "Discover Claroche activewear. Filter by fit, color, or price and shop the latest arrivals.",
  },
};

type ShopPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const addProductId =
    typeof searchParams?.add === "string" ? (searchParams?.add as string) : undefined;
  const addVariantId =
    typeof searchParams?.variant === "string" ? (searchParams?.variant as string) : undefined;
  const redirectParam =
    typeof searchParams?.redirect === "string" ? (searchParams?.redirect as string) : undefined;
  const refCode = typeof searchParams?.ref === "string" ? (searchParams?.ref as string) : undefined;

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

  const { items } = await getProductList({ take: 16 });
  const baseProducts: HomeProduct[] = items.map((product, index) => ({
    id: product.id,
    slug: product.slug,
    title: product.title,
    price: product.minVariantPrice ?? product.price,
    thumbnailUrl: product.thumbnailUrl ?? null,
    badge: index % 3 === 0 ? "New" : index % 3 === 1 ? "Trending" : "Soft Touch",
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      price: variant.price,
      stock: variant.stock,
      size: variant.size,
      color: variant.color,
    })),
  }));
  const womensProducts = baseProducts.slice(0, 8);
  const mensProducts = baseProducts.slice(4, 12);

  const heroSlides = [
    {
      id: "women",
      title: "Cosy Luxe x Soft Sculpt",
      eyebrow: "New in",
      description: "All turning heads in burgundy, this season's hottest hue.",
      imageUrl:
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1400&q=80",
      primaryCta: { label: "Shop new in", href: "/shop?sort=new" },
      secondaryCta: { label: "Burgundy sets", href: "/shop?color=burgundy" },
      alignment: "left" as const,
    },
    {
      id: "men",
      title: "For Winter Workouts",
      eyebrow: "Menswear",
      description: "New graphics that match your gym aesthetic. Head down, focus up.",
      imageUrl:
        "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1400&q=80",
      primaryCta: { label: "Winter shop", href: "/shop?collection=winter" },
      secondaryCta: { label: "New in", href: "/shop?sort=new&gender=men" },
      alignment: "right" as const,
    },
  ];

  return (
    <div className="mx-auto flex max-w-[1120px] flex-col gap-14 px-4 py-12 sm:px-6 lg:px-0">
      <AddFromLinkHandler payload={autoAddPayload} />
      <HeroSection slides={heroSlides} />

      <ProductCarousel
        eyebrow="Womens"
        title="New in"
        products={womensProducts}
        viewAllHref="/shop?gender=women"
        variantLabel="women"
      />

      <ProductCarousel
        eyebrow="Mens"
        title="For winter workouts"
        products={mensProducts}
        viewAllHref="/shop?gender=men"
        variantLabel="men"
      />
    </div>
  );
}
