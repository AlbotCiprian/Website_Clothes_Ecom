import bcrypt from "bcryptjs";
import { PrismaClient, type User } from "@prisma/client";

const prisma = new PrismaClient();

interface SeedVariant {
  name: string;
  sku?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  size?: string;
  color?: string;
}

interface SeedReview {
  rating: number;
  title?: string;
  body: string;
  status?: string;
  authorName: string;
  authorEmail?: string;
}

interface SeedLinkTracker {
  label: string;
  url: string;
  medium?: string;
}

type SeedProduct = {
  title: string;
  slug: string;
  description?: string;
  price: number;
  currency?: string;
  thumbnailUrl?: string;
  status?: string;
  variants: SeedVariant[];
  reviews: SeedReview[];
  linkTrackers: SeedLinkTracker[];
};

const productSeedData: SeedProduct[] = [
  {
    title: "Aurora Silk Blouse",
    slug: "aurora-silk-blouse",
    description:
      "Fluid silk blouse with a relaxed drape, hidden placket, and pearlescent buttons crafted for effortless layering.",
    price: 14900,
    currency: "USD",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    status: "PUBLISHED",
    variants: [
      {
        name: "Ivory / XS",
        sku: "BL-AURORA-IVORY-XS",
        price: 14900,
        stock: 8,
        imageUrl:
          "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
        size: "XS",
        color: "Ivory",
      },
      {
        name: "Ivory / S",
        sku: "BL-AURORA-IVORY-S",
        price: 14900,
        stock: 14,
        imageUrl:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
        size: "S",
        color: "Ivory",
      },
    ],
    reviews: [
      {
        rating: 5,
        title: "Ultra soft and polished",
        body: "The fabric feels luxurious and the color saturation is gorgeous.",
        status: "APPROVED",
        authorName: "Sienna Park",
        authorEmail: "sienna.park@example.com",
      },
      {
        rating: 4,
        title: "Great drape",
        body: "Love the way this blouse falls but sizing runs a touch generous.",
        status: "PENDING",
        authorName: "Dana Cho",
        authorEmail: "dana.cho@example.com",
      },
    ],
    linkTrackers: [
      {
        label: "Instagram Editorial",
        url: "https://claroche.shop/products/aurora-silk-blouse?utm_source=instagram&utm_medium=social",
        medium: "social",
      },
    ],
  },
  {
    title: "Midnight Tailored Blazer",
    slug: "midnight-tailored-blazer",
    description:
      "Structured wool blend blazer with sculpted shoulders, satin lining, and tonal horn buttons.",
    price: 27900,
    currency: "USD",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=70",
    status: "PUBLISHED",
    variants: [
      {
        name: "Navy / 36",
        sku: "BLZ-MIDNIGHT-NAVY-36",
        price: 27900,
        stock: 6,
        imageUrl:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
        size: "36",
        color: "Navy",
      },
      {
        name: "Charcoal / 40",
        sku: "BLZ-MIDNIGHT-CHARCOAL-40",
        price: 27900,
        stock: 7,
        imageUrl:
          "https://images.unsplash.com/photo-1555952517-2e8e729e0b44?auto=format&fit=crop&w=800&q=80",
        size: "40",
        color: "Charcoal",
      },
    ],
    reviews: [
      {
        rating: 5,
        title: "Tailoring perfection",
        body: "Sharp lines and the interior pocketing is so thoughtful.",
        status: "APPROVED",
        authorName: "Rory Patel",
        authorEmail: "rory.patel@example.com",
      },
    ],
    linkTrackers: [
      {
        label: "Press Feature",
        url: "https://claroche.shop/press/midnight-blazer",
        medium: "press",
      },
    ],
  },
  {
    title: "Coastal Linen Shirt Dress",
    slug: "coastal-linen-shirt-dress",
    description:
      "Breathable linen shirt dress with removable sash belt and side seam pockets for effortless summer styling.",
    price: 18900,
    currency: "USD",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=65",
    status: "PUBLISHED",
    variants: [
      {
        name: "Sand / XS",
        sku: "DR-COASTAL-SAND-XS",
        price: 18900,
        stock: 13,
        imageUrl:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=70",
        size: "XS",
        color: "Sand",
      },
      {
        name: "Seafoam / M",
        sku: "DR-COASTAL-SEAFOAM-M",
        price: 18900,
        stock: 12,
        imageUrl:
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=75",
        size: "M",
        color: "Seafoam",
      },
    ],
    reviews: [
      {
        rating: 5,
        title: "Summer essential",
        body: "Pockets deep enough for my phone and compliments all day.",
        status: "APPROVED",
        authorName: "Jamie Ortega",
        authorEmail: "jamie.ortega@example.com",
      },
    ],
    linkTrackers: [
      {
        label: "Vacation Guide",
        url: "https://claroche.shop/stories/coastal-linen-edit",
        medium: "blog",
      },
    ],
  },
  {
    title: "Horizon Quilted Parka",
    slug: "horizon-quilted-parka",
    description:
      "Longline quilted parka with recycled down fill, water-repellent shell, and adjustable hood.",
    price: 34900,
    currency: "USD",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=780&q=60",
    status: "PUBLISHED",
    variants: [
      {
        name: "Coal / S",
        sku: "PRK-HORIZON-COAL-S",
        price: 34900,
        stock: 8,
        imageUrl:
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=780&q=65",
        size: "S",
        color: "Coal",
      },
      {
        name: "Olive / L",
        sku: "PRK-HORIZON-OLIVE-L",
        price: 34900,
        stock: 5,
        imageUrl:
          "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=780&q=65",
        size: "L",
        color: "Olive",
      },
    ],
    reviews: [
      {
        rating: 5,
        title: "Warmth without bulk",
        body: "Kept me warm in 20°F with minimal layering.",
        status: "APPROVED",
        authorName: "Noah Kendall",
        authorEmail: "noah.kendall@example.com",
      },
    ],
    linkTrackers: [
      {
        label: "Winter Campaign",
        url: "https://claroche.shop/campaigns/horizon-parka",
        medium: "campaign",
      },
    ],
  }
];

function resolveReviewStatus(value?: string) {
  if (!value) {
    return "PENDING";
  }

  const normalised = `${value}`.toUpperCase();
  const allowed = ["PENDING", "APPROVED", "REJECTED"];
  return allowed.includes(normalised) ? normalised : "PENDING";
}

function resolveProductStatus(value?: string) {
  if (!value) {
    return "PUBLISHED";
  }

  const normalised = `${value}`.toUpperCase();
  const allowed = ["DRAFT", "PUBLISHED", "ARCHIVED"];
  return allowed.includes(normalised) ? normalised : "PUBLISHED";
}

async function resetDatabase() {
  await prisma.$transaction([
    prisma.trackingEvent.deleteMany(),
    prisma.addToCartEvent.deleteMany(),
    prisma.hit.deleteMany(),
    prisma.linkTracker.deleteMany(),
    prisma.review.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.variant.deleteMany(),
    prisma.product.deleteMany(),
    prisma.sellerUser.deleteMany(),
    prisma.seller.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.authenticator.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "founder@claroche.shop";
  const plainPassword = process.env.SEED_ADMIN_PASSWORD ?? "Claroche#2025!";
  const passwordHash = await bcrypt.hash(plainPassword, 12);

  const admin = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      role: "admin",
      name: "Claroche Admin",
    },
  });

  console.info("Admin credentials:");
  console.info("  email:", email);
  console.info("  password:", plainPassword);

  return admin;
}

async function seedSellers(adminUser: User) {
  const sellerPassword = "Seller#12345!";
  const sellerPasswordHash = await bcrypt.hash(sellerPassword, 12);

  const clarocheSeller = await prisma.seller.create({
    data: {
      name: "Claroche Studio",
      slug: "claroche-studio",
      status: "ACTIVE",
      description: "Claroche in-house edits and collaborations.",
      supportEmail: "studio@claroche.shop",
      website: "https://claroche.shop",
      members: {
        create: {
          role: "owner",
          user: {
            connect: { id: adminUser.id },
          },
        },
      },
    },
  });

  const boutiqueSellerUser = await prisma.user.create({
    data: {
      email: "seller@atelierclaroche.shop",
      password: sellerPasswordHash,
      role: "seller",
      name: "Atelier Seller",
    },
  });

  const boutiqueSeller = await prisma.seller.create({
    data: {
      name: "Atelier Nocturne",
      slug: "atelier-nocturne",
      status: "ACTIVE",
      description: "Independent creator collective powered by Claroche.",
      supportEmail: "atelier@claroche.shop",
      website: "https://atelier.claroche.shop",
      members: {
        create: {
          role: "owner",
          user: {
            connect: { id: boutiqueSellerUser.id },
          },
        },
      },
    },
  });

  console.info("Demo seller credentials:");
  console.info("  email:", boutiqueSellerUser.email);
  console.info("  password:", sellerPassword);

  return {
    defaultSellerId: clarocheSeller.id,
    secondarySellerId: boutiqueSeller.id,
  };
}

async function seedProducts(defaultSellerId: string, secondarySellerId: string) {
  for (const [index, product] of productSeedData.entries()) {
    const sellerId = index % 2 === 0 ? defaultSellerId : secondarySellerId;

    await prisma.product.create({
      data: {
        title: product.title,
        slug: product.slug,
        description: product.description,
        price: product.price,
        currency: product.currency ?? "USD",
        thumbnailUrl: product.thumbnailUrl,
        status: resolveProductStatus(product.status),
        seller: {
          connect: { id: sellerId },
        },
        variants: {
          create: product.variants.map((variant) => ({
            name: variant.name,
            sku: variant.sku,
            price: variant.price,
            stock: variant.stock,
            imageUrl: variant.imageUrl,
            size: variant.size,
            color: variant.color,
          })),
        },
        reviews: {
          create: product.reviews.map((review) => ({
            rating: review.rating,
            title: review.title,
            body: review.body,
            status: resolveReviewStatus(review.status),
            authorName: review.authorName,
            authorEmail: review.authorEmail,
          })),
        },
        linkTrackers: {
          create: product.linkTrackers.map((tracker) => ({
            label: tracker.label,
            url: tracker.url,
            medium: tracker.medium,
            code: createLinkCode(),
            target: "PDP",
          })),
        },
      },
    });
  }
}

function createLinkCode(length = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    code += alphabet[randomIndex];
  }
  return code;
}

async function main() {
  console.info("Resetting database...");
  await resetDatabase();

  console.info("Seeding admin user...");
  const adminUser = await seedAdmin();

  console.info("Seeding sellers...");
  const { defaultSellerId, secondarySellerId } = await seedSellers(adminUser);

  console.info("Seeding catalog...");
  await seedProducts(defaultSellerId, secondarySellerId);

  console.info("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
