# swiftpay-link – Project Overview

## Purpose
swiftpay-link is a checkout-by-link platform. Sellers generate short links that preconfigure a cart (products, variants, quantities). Customers open the link from chat/social/DM and are dropped into a minimal checkout to confirm items, add delivery details, choose payment (MIA/Card/ApplePay/GooglePay in future), and pay. This phase sets the architecture and foundational flows; payment/courier integrations will come later.

## Key User Flows
- **Seller**
  - Create products and variants with stock and price overrides.
  - Create campaign links with a short code, attach one or more variant lines and quantities, set active/expiry.
  - Share the link; later inspect hits/conversions (EventLog in this phase).
- **Customer**
  - Open `/c/{code}` link.
  - System resolves the link, creates/reuses a server cart (cookie token), preloads items, and redirects to `/checkout`.
  - Review cart, adjust quantities, or clear cart (future steps will add address/payment).

## High-Level Architecture
- **Frontend (Next.js 15 App Router, TypeScript, Tailwind, shadcn-ui)**  
  - Pages: home, checkout, link resolver (`/c/[code]`), link-not-found.
  - Shared layout with Claroche-inspired header, search placeholder, and cart affordances.
  - Server components where possible; client components for interactive cart controls.
- **Backend (Next.js server routes + Prisma)**  
  - PostgreSQL via Prisma ORM. Models: User, Seller, Product, ProductVariant, Link, LinkItem, Cart, CartItem, EventLog.
  - API routes for cart CRUD (`/api/cart`, `/api/cart/items`) and link resolver page to hydrate cart from LinkItems.
  - Cookie-based cart identification (`cart_token`).
- **External Services (future)**
  - PSPs (MIA/Card/ApplePay/GooglePay) and couriers (MUVI) are future integrations; architecture leaves space.
  - Observability to be wired later (Sentry/logging).

## Reusable Ideas from Claroche
- Visual language: clean header with centered brand, muted neutrals, rounded cards, strong CTA buttons, subtle shadows, generous spacing.
- Component patterns: hero banner, product cards with badges/prices, responsive grids, consistent padding and radius scale.
- Data patterns: product + variant separation, link-based cart prefill, event logging for link hits/add-to-cart.
