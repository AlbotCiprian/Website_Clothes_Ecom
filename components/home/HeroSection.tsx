"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  imageUrl: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  alignment?: "left" | "right";
};

const AUTOPLAY_INTERVAL = 6500;

type HeroSectionProps = {
  slides: HeroSlide[];
};

export default function HeroSection({ slides }: HeroSectionProps) {
  const validSlides = useMemo(() => slides.filter(Boolean), [slides]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (validSlides.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % validSlides.length);
    }, AUTOPLAY_INTERVAL);

    return () => {
      window.clearInterval(timer);
    };
  }, [validSlides.length]);

  if (validSlides.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-neutral-200 bg-black text-white shadow-xl">
      <AnimatePresence mode="wait">
        {validSlides.map((slide, index) =>
          index === activeIndex ? (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0.4, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="relative grid min-h-[540px] grid-cols-1 overflow-hidden md:grid-cols-2"
            >
              <div className="relative hidden h-full md:block">
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/15 to-black/10" />
              </div>

              <div
                className={cn(
                  "relative flex flex-col justify-center gap-6 px-8 py-14 sm:px-14 md:px-12",
                  slide.alignment === "right" ? "md:order-last" : "md:order-first",
                )}
              >
                <div className="flex flex-col gap-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-200">
                    {slide.eyebrow}
                  </span>
                  <h1 className="text-4xl font-semibold sm:text-5xl">{slide.title}</h1>
                  <p className="max-w-lg text-sm text-neutral-200 sm:text-base">{slide.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={slide.primaryCta.href}
                    className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
                  >
                    {slide.primaryCta.label}
                  </Link>
                  {slide.secondaryCta ? (
                    <Link
                      href={slide.secondaryCta.href}
                      className="rounded-full border border-white/60 px-7 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
                    >
                      {slide.secondaryCta.label}
                    </Link>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ) : null,
        )}
      </AnimatePresence>

      {validSlides.length > 1 ? (
        <div className="absolute bottom-6 right-8 flex items-center gap-3">
          {validSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                "h-2.5 w-6 rounded-full transition",
                index === activeIndex ? "bg-white" : "bg-white/40 hover:bg-white/80",
              )}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
