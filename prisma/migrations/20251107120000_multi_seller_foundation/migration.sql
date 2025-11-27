PRAGMA foreign_keys=OFF;

-- CreateTable
CREATE TABLE "Seller" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "supportEmail" TEXT,
    "website" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SellerUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL DEFAULT 'owner',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sellerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "SellerUser_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SellerUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create default legacy seller
INSERT INTO "Seller" ("id", "name", "slug", "status", "createdAt", "updatedAt")
VALUES ('seller_claroche_legacy', 'Claroche Legacy', 'claroche-legacy', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Rebuild Product table with seller reference
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "thumbnailUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "sellerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "new_Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Product" ("id", "title", "slug", "description", "price", "currency", "thumbnailUrl", "status", "sellerId", "createdAt", "updatedAt")
SELECT "id", "title", "slug", "description", "price", "currency", "thumbnailUrl", "status", 'seller_claroche_legacy', "createdAt", "updatedAt"
FROM "Product";

DROP TABLE "Product";

ALTER TABLE "new_Product" RENAME TO "Product";

-- CreateIndex
CREATE UNIQUE INDEX "Seller_slug_key" ON "Seller"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SellerUser_sellerId_userId_key" ON "SellerUser"("sellerId", "userId");

-- Re-create Product indexes
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_status_idx" ON "Product"("status");
CREATE INDEX "Product_sellerId_idx" ON "Product"("sellerId");

PRAGMA foreign_keys=ON;
