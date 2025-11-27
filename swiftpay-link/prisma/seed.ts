import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const seller = await prisma.seller.upsert({
    where: { slug: "demo-seller" },
    update: {},
    create: {
      name: "Demo Seller",
      slug: "demo-seller",
      logoUrl: "https://dummyimage.com/120x40/0b0b0b/ffffff&text=Swiftpay",
    },
  });

  const products = [
    {
      name: "Motion Tee",
      description: "Lightweight tee for everyday moves.",
      basePrice: "39.00",
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
      variants: [
        { sku: "MT-BLK-S", color: "Black", size: "S", stock: 25, price: "39.00" },
        { sku: "MT-GRY-M", color: "Grey", size: "M", stock: 18, price: "41.00" },
      ],
    },
    {
      name: "Flow Jogger",
      description: "Tapered jogger with stretch waistband and cuffed hems.",
      basePrice: "69.00",
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      variants: [
        { sku: "FJ-NVY-M", color: "Navy", size: "M", stock: 15, price: "69.00" },
        { sku: "FJ-NVY-L", color: "Navy", size: "L", stock: 10, price: "69.00" },
      ],
    },
    {
      name: "Lumen Hoodie",
      description: "Soft brushed hoodie with minimalist lines and cozy hood.",
      basePrice: "89.00",
      imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
      variants: [
        { sku: "LH-BRG-S", color: "Burgundy", size: "S", stock: 12, price: "89.00" },
        { sku: "LH-BRG-M", color: "Burgundy", size: "M", stock: 8, price: "89.00" },
      ],
    },
  ];

  const createdProducts = [];
  for (const product of products) {
    const created = await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        imageUrl: product.imageUrl,
        sellerId: seller.id,
        variants: {
          create: product.variants.map((variant) => ({
            sku: variant.sku,
            color: variant.color,
            size: variant.size,
            stock: variant.stock,
            price: variant.price,
          })),
        },
      },
      include: { variants: true },
    });
    createdProducts.push(created);
  }

  const allVariants = createdProducts.flatMap((p) => p.variants);

  if (allVariants.length >= 2) {
    await prisma.link.upsert({
      where: { code: "DEMO123" },
      update: {},
      create: {
        code: "DEMO123",
        sellerId: seller.id,
        name: "Demo WhatsApp Drop",
        active: true,
        expiresAt: null,
        items: {
          create: [
            { productVariantId: allVariants[0]!.id, quantity: 1 },
            { productVariantId: allVariants[1]!.id, quantity: 2 },
          ],
        },
      },
    });
  }

  console.info("Seed completed. Demo link code: DEMO123");
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
