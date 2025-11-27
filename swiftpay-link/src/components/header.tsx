import Link from "next/link";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/90 backdrop-blur">
      <div className="container-shell flex items-center gap-4 py-4">
        <Link href="/" className="text-lg font-semibold uppercase tracking-[0.35em] text-neutral-900">
          swiftpay-link
        </Link>
        <div className="hidden flex-1 md:block">
          <Input placeholder="Search (coming soon)" aria-label="Search placeholder" />
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/checkout"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            aria-label="Go to checkout"
          >
            <ShoppingCartIcon className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="container-shell pb-3 md:hidden">
        <Input placeholder="Search (coming soon)" aria-label="Search placeholder" />
      </div>
    </header>
  );
}
