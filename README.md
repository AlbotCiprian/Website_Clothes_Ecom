## Claroche

Claroche este un magazin online de activewear construit cu Next.js 15, TypeScript, Tailwind CSS și shadcn/ui. Proiectul își propune o experiență mobilă, curată și îndrăzneață, inspirată din stilul Gymshark, dar complet originală.

### Stack
- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui + Radix UI primitives

### Structură de foldere
- `app/` – layout global, pagina principală și stiluri
- `components/` – componente partajate și UI (button, input, sheet, accordion)
- `public/` – favicon SVG
- Configurații: `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`

### Scripturi disponibile
- `npm run dev` – pornește mediul de dezvoltare
- `npm run build` – generează build-ul de producție
- `npm run start` – rulează serverul în modul producție
- `npm run lint` – rulează verificările ESLint

### Pași inițiali
1. Instalează dependențele: `npm install`
2. Rulează mediul local: `npm run dev`
3. Accesează `http://localhost:3000` pentru a vedea claroche.

### Politici media
- Imaginile folosesc doar URL-uri externe (Unsplash / Cloudinary)
- Repo-ul nu acceptă fișiere binare (png/jpg/webp/ico/woff2); vezi regulile din `.gitignore`
