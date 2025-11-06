import Link from "next/link";
import CartDrawer from "@/components/CartDrawer";
import SearchBar from "@/components/SearchBar";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-[0.4em] uppercase text-neutral-900">
          Claroche
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
