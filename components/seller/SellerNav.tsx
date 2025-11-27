"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SellerSummary } from "@/types/auth";

type SellerNavProps = {
  seller: SellerSummary;
  userEmail?: string | null;
};

const links = [
  { href: "/seller/dashboard", label: "Dashboard" },
  { href: "/seller/products", label: "Products" },
];

export default function SellerNav({ seller, userEmail }: SellerNavProps) {
  const pathname = usePathname();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
            Seller Portal
          </p>
          <p className="text-sm font-semibold text-neutral-900">{seller.name}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-sm text-neutral-600">
          {links.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-1 transition",
                  active
                    ? "bg-neutral-900 text-white"
                    : "hover:bg-neutral-900/5 hover:text-neutral-900",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          {userEmail ? <span className="hidden sm:inline">{userEmail}</span> : null}
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/seller/login" })}
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
