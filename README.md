# swiftpay-link (Claroche)

Next.js 15 App Router storefront + checkout by link. Stack: TypeScript, Tailwind, shadcn-ui, Prisma, Postgres.

## Getting Started

```bash
npm install
npm run dev
```

## Deployment (Vercel)

1. Set Vercel env vars  
   - `DATABASE_URL` (Postgres connection string)  
   - `APP_URL` (e.g. https://your-app.vercel.app)
2. Vercel will run `npm install` (triggers `prisma generate` via `postinstall`) then `npm run build`.
3. Apply production migrations before/after first deploy: `npm run db:deploy` against the production database.
4. Connect the repo to Vercel and deploy. No extra config needed beyond `vercel.json`.
