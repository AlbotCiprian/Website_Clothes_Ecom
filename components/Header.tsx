"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import CartDrawer from "@/components/CartDrawer";
import SearchBar from "@/components/SearchBar";

export default function Header() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo_claroche.png"
            alt="Claroche"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
          />
          <span className="text-lg font-semibold uppercase tracking-[0.35em] text-neutral-900">
            Claroche
          </span>
        </Link>
        <div className="flex-1">
          <div className="hidden md:block">
            <SearchBar />
          </div>
        </div>
        <CartDrawer />
      </div>
      <div className="px-6 pb-4 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
