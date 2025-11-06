## Claroche

Claroche is an activewear storefront built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui. This update wires in Prisma for data modelling plus NextAuth credentials-based authentication, with SQLite as the default database and a ready-to-switch PostgreSQL setup.

### Stack
- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui (Radix UI primitives)
- Prisma ORM (`prisma/schema.prisma`)
- NextAuth Credentials Provider
- SQLite by default / PostgreSQL when `DATABASE_URL` points to Postgres

### Folder Structure
- `app/` - layouts, pages, and the auth route handler (`app/api/auth/[...nextauth]`)
- `components/` - shared UI components
- `lib/` - project utilities plus `db.ts` (Prisma client) and `auth.ts` (NextAuth config)
- `prisma/` - `schema.prisma`, TypeScript seed script, and catalog data (`data/products.seed.json`)
- `public/` - static assets (favicon)
- Config files: `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`

### Quick Start
1. Copy `.env.example` to `.env` and adjust values if needed.
2. Install dependencies: `npm install`
3. Generate Prisma Client: `npm run prisma:generate`
4. Apply database migrations (SQLite by default): `npm run prisma:migrate`
5. Seed the database with the admin user and demo catalog: `npm run prisma:seed`
6. Start the dev server: `npm run dev`
7. Visit `http://localhost:3000`

### Available Scripts
- `npm run dev` - start the development server
- `npm run build` - build for production
- `npm run start` - run the production server
- `npm run lint` - run ESLint checks
- `npm run prisma:generate` - generate Prisma Client
- `npm run prisma:migrate` - run development migrations
- `npm run prisma:seed` - execute the Prisma seed script

The seed script provisions:
- Admin account `admin@claroche.shop` with password `Admin#12345`
- 12 demo products, each with variants, reviews (approved and pending), and link trackers

### Admin Access
- Visit `/admin/login` and sign in with the seeded admin credentials.
- The admin shell exposes a dashboard (7/30 day KPIs), product CRUD (with variant management), review moderation, and a campaign link generator with hit analytics.
- All admin routes require an authenticated session with the `admin` role; the UI signs out via NextAuth.

### PostgreSQL Ready
- Point `DATABASE_URL` at your Postgres instance.
- Update `provider` inside `prisma/schema.prisma` to `"postgresql"`.
- Re-run `npm run prisma:migrate` to apply migrations.

### Media Policy
- Only remote image URLs (Unsplash / Cloudinary) are used.
- The repo should not contain binary assets (png/jpg/webp/ico/woff2); refer to `.gitignore` for details.
