## Post-Update Console Steps

From project root:

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

If you also work in `swiftpay-link/`:

```bash
cd swiftpay-link
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```
