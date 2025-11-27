# Milestones

## Milestone 0 – Foundation & Setup
- Scaffold Next.js 15 App Router project with TypeScript strict, Tailwind, and shadcn-ui.
- Base layout: Claroche-inspired header, search placeholder, cart icon placeholder; home page describing the checkout-by-link concept with a link to `/checkout`.
- Environment scaffolding: `.env.example` with `DATABASE_URL`, `APP_URL`.
- Scripts: dev, build, start, lint, db:migrate, db:generate, db:seed.
- Prisma initialized with core models and seed data (demo seller, products, variants, optional link).

## Milestone 1 – Server-Side Cart + Link Resolver
- Cookie-based cart identification (`cart_token`) utility reusable by routes and server components.
- Cart API: `GET /api/cart`, `POST /api/cart/items` (upsert quantity), `DELETE /api/cart`.
- Link resolver `/c/[code]`:
  - Validate active/non-expired link.
  - Reset current cart and hydrate items from LinkItems.
  - Log Event (`link_hit`) and redirect to `/checkout` or `/link-not-found` on error.
- Basic `/checkout` page showing cart contents, totals, quantity controls, and clear-cart action, styled consistent with Claroche UI.
