"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Despre Claroche", href: "/about" },
  { label: "Livrare", href: "/shipping" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-neutral-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} Claroche. Toate drepturile rezervate.</p>
        <nav className="flex flex-wrap gap-4" aria-label="Linkuri utile Claroche">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="transition hover:text-neutral-900">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
