import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="relative isolate overflow-hidden bg-neutral-50">
      <div className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
            Noua colecție toamnă 2025
          </p>
          <h1 className="text-4xl font-bold leading-tight text-neutral-900 sm:text-5xl md:text-6xl">
            Claroche redefinește activewear-ul cu linii curate și accent pe mobilitate.
          </h1>
          <p className="text-base text-neutral-600 md:text-lg">
            Materiale respirabile, croiuri gândite pentru mișcare și un stil care te însoțește din
            sală până în oraș.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="px-8">
              <Link href="/shop" aria-label="Vezi colecția Claroche">
                Vezi colecția
              </Link>
            </Button>
            <Button variant="ghost" asChild size="lg" className="text-neutral-900">
              <Link href="/lookbook" aria-label="Descoperă lookbook Claroche">
                Lookbook
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100">
          <Image
            src="https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80"
            alt="Athlete wearing Claroche activewear"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      </div>
    </section>
  );
}
