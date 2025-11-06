import path from "path";
import { readFile } from "fs/promises";

import bcrypt from "bcryptjs";
import {
  PrismaClient,
  ProductStatus,
  ReviewStatus,
  UserRole,
} from "@prisma/client";

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
  status?: keyof typeof ReviewStatus | string;
  authorName: string;
  authorEmail?: string;
}

interface SeedLinkTracker {
  label: string;
  url: string;
  medium?: string;
}

interface SeedProduct {
  title: string;
  slug: string;
  description?: string;
  price: number;
  currency?: string;
  thumbnailUrl?: string;
  status?: keyof typeof ProductStatus | string;
  variants: SeedVariant[];
  reviews: SeedReview[];
  linkTrackers: SeedLinkTracker[];
}

function resolveReviewStatus(
  value?: keyof typeof ReviewStatus | string,
): ReviewStatus {
  if (!value) {
    return ReviewStatus.PENDING;
  }

  const normalised = `${value}`.toUpperCase() as keyof typeof ReviewStatus;
  return ReviewStatus[normalised] ?? ReviewStatus.PENDING;
}

function resolveProductStatus(
  value?: keyof typeof ProductStatus | string,
): ProductStatus {
  if (!value) {
    return ProductStatus.PUBLISHED;
  }

  const normalised = `${value}`.toUpperCase() as keyof typeof ProductStatus;
  return ProductStatus[normalised] ?? ProductStatus.PUBLISHED;
}

async function resetDatabase() {
  await prisma.$transaction([
    prisma.hit.deleteMany(),
    prisma.linkTracker.deleteMany(),
    prisma.review.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.variant.deleteMany(),
    prisma.product.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.authenticator.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function seedAdmin() {
  const email = "admin@claroche.shop";
  const plainPassword = "Admin#12345";
  const passwordHash = await bcrypt.hash(plainPassword, 12);

  await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      role: UserRole.admin,
      name: "Claroche Admin",
    },
  });
}

async function seedProducts() {
  const seedFile = path.join(__dirname, "data", "products.seed.json");
  const fileContent = await readFile(seedFile, "utf-8");
  const products = JSON.parse(fileContent) as SeedProduct[];

  for (const product of products) {
    await prisma.product.create({
      data: {
        title: product.title,
        slug: product.slug,
        description: product.description,
        price: product.price,
        currency: product.currency ?? "USD",
        thumbnailUrl: product.thumbnailUrl,
        status: resolveProductStatus(product.status),
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
          })),
        },
      },
    });
  }
}

async function main() {
  console.info("Resetting database...");
  await resetDatabase();

  console.info("Seeding admin user...");
  await seedAdmin();

  console.info("Seeding catalog...");
  await seedProducts();

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
